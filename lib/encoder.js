var RTCCodecs = require("./codecs.js");
var RTCEncoding = require("./encoding.js");
var registry = require("./registry.js");
var maxId = 0;


var privates = new WeakMap();

var defaultParams = {
	
};

var RTCEncoder = function(id,codec,params,encoding)
{
	//Create private data
	var private = {
		id		: id,
		maxId		: 0,
		codec		: codec,
		isClosed	: false,
		params		: Object.assign(defaultParams,params),
		encodings	: {}
	};
	//Store private data in weak map
	privates.set(this,private);
	
	//Do we need to create a default encodor?
	if (!private.params.nodefault)
		//Add default encoding with input params
		private.encodings["default"] = new RTCEncoding("default",this,null,encoding);
	//Define read only properties
	Object.defineProperties(this, {
		id: {
			value: private.id,
			writable: false
		},
		codec: {
			value: private.codec,
			writable: false
		},
		track: {
			get: function() { 
				return private.track; 
			},
			set: function(track) {
				//Change it on the muxer
				var promise = registry.setEncoderTrack(this,private.track);
				//Set it
				private.track = track;
				//return promise
				return promise;
			}
		},
		encodings: {
			value: private.encodings,
			writable: false
		},
		isClosed: {
			value: private.isClosed,
			writable: false
		}
	});
};

RTCEncoder.prototype.addEncoding = function(params)
{
	//Get private data
	var private = privates.get(this);
	
	//Check if encoder is already closed
	if (private.isClosed)
		//Invalid starte
		throw new Error("Encoder is already closed");
	
	//Get id
	var id = private.maxId++;
	//Create encoding
	var encoding =  new RTCEncoding(id,this,null,params);
	//Add subencoding
	private.encodings[id] = encoding;
	//Return it
	return encoding;
};

RTCEncoder.prototype.removeEncoding = function(encoding)
{
	//Get private data
	var private = privates.get(this);
	
	//Check if encoder is already closed
	if (private.isClosed)
		//Invalid starte
		throw new Error("Encoder is already closed");

	//Delete it from map
	delete(private.encodings[encoding.id]);
	//Destroy encoding and subencodings
	return encoding.close();
};

RTCEncoder.prototype.send = function(stream,params)
{
	//Get private data
	var private = privates.get(this);
	
	//Check if encoder is already closed
	if (private.isClosed)
		//Invalid starte
		throw new Error("Encoder is already closed");

	//Get encoding ids
	var keys = Object.keys(private.encodings) ;
	//Check if we don't have the default
	if (keys.length===0)
		throw new Error("Invalid params, there are no encoder in this encoder");
	//Check if we only have the defautl
	if (keys.length!==1)
		throw new Error("Invalid params, there are more than one encoding in this encoder");
		
	//Single encoding helper
	return private.encodings[keys[0]].send(stream,params);
};

RTCEncoder.prototype.stop = function()
{
	//Array of promises
	var promises = [];
	
	//Get private data
	var private = privates.get(this);
	
	//Check if encoder is already closed
	if (private.isClosed)
		//Invalid starte
		throw new Error("Encoder is already closed");

	//Stop sending all encodings
	for (var encoding in private.encodings)
		//Stop it, an sll its sub encodings
		promises.push(encoding.stop());
	
	//return all promises
	return Promise.all(promises);
};

RTCEncoder.prototype.close = function()
{
	//Array of promises
	var promises = [];
	
	//Get private data
	var private = privates.get(this);
	
	//Check if encoder is already closed
	if (private.isClosed)
		//Invalid starte
		throw new Error("Encoder is already closed");
	
	//Close all encodings
	for (var encoding in private.encodings)
		//close it, an sll its sub encodings
		promises.push(encoding.close());
	
	//We are closed
	private.isClosed = true;
	
	//return all promises
	return Promise.all(promises);
};


var RTCEncoderFactory = function()
{
};

/*
 * Factory object for RTCEncoder
 */
RTCEncoderFactory.prototype.create = function(codec,params,encoding)
{
	return new RTCEncoder(maxId++,codec,params,encoding);
};

//Export factory singleton
module.exports = new RTCEncoderFactory();
