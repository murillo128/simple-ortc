var regsitry = require('./registry.js');

var privates = new WeakMap();

var RTCEncoding = function(id,encoder,parent,params)
{
	//Create private data
	var private = {
		maxId : 0,
		//Encoder properties
		id : id,
		encoder : encoder,
		parent : parent,
		isClosed : false,
		//Clone params object and set default ones
		params : Object.assign({
			
			},
			params
		),
		//Create the map with all the dependant encodings
		subencodings : {}
	};
	
	//Store as private data
	privates.set(this,private);
	
	//Define read only properties
	Object.defineProperties(this, {
		id: {
			value: private.id,
			writable: false
		},
		params: {
			value: private.params,
			writable: false
		},
		encoder: {
			value: private.encoder,
			writable: false
		},
		parent: {
			value: private.parent,
			writable: false
		},
		subencodings: {
			value: private.subencodings,
			writable: false
		},
		isClosed: {
			value: private.isClosed,
			writable: false
		}
	});
};

RTCEncoding.prototype.send = function(stream,params)
{
	//Get private data
	var private = privates.get(this);
	
	//Check if encoder is already closed
	if (private.isClosed)
		//Invalid starte
		throw new Error("Encoder is already closed");
	
	//Store send stream
	private.stream = stream;
	//Add payload
	return regsitry.addPayload(this,stream,params);
};

RTCEncoding.prototype.pause = function(flag)
{
	//Get private data
	var private = privates.get(this);
	
	//Check if encoder is already closed
	if (private.isClosed)
		//Invalid starte
		throw new Error("Encoder is already closed");
	
	//Add payload
	return regsitry.pausePayload(this,flag);
};

RTCEncoding.prototype.stop = function()
{
	//Get private data
	var private = privates.get(this);
	
	//Check if encoder is already closed
	if (private.isClosed)
		//Invalid starte
		throw new Error("Encoder is already closed");
	
	//Check id not sending
	if (!private.stream)
		//Do nothing
		return;
	
	//Stop sending
	delete(private.stream);
	//Stop all subencodngs recursive
	for(var subencoding in private.subencodings)
		//Stop them
		subencoding.stop();
	//Update regsitry
	return regsitry.deletePayload(this,stream);
};

RTCEncoding.prototype.addSubEncoding = function(params)
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
	var encoding =  new RTCEncoding(id,this.encoder,this,params);
	//Add subencoding
	private.subencodings[id] = encoding;
	//Return it
	return encoding;
};

RTCEncoding.prototype.removeSubEncoding = function(subencoding)
{
	//Get private data
	var private = privates.get(this);
	
	//Check if encoder is already closed
	if (private.isClosed)
		//Invalid starte
		throw new Error("Encoder is already closed");
	
	//Delete it from map
	delete(private.subencodings[subencoding.id]);
	//Stop sending it just in case
	return subencoding.stop();
	
};

RTCEncoding.prototype.close = function()
{
	//Array of promises
	var promises =  [];
	
	//Get private data
	var private = privates.get(this);
	
	//Check if encoder is already closed
	if (private.isClosed)
		//Invalid starte
		throw new Error("Encoder is already closed");
	
	//Close all encodings
	for (var encoding in private.subencodings)
		//close it, an sll its sub encodings
		promises.push(encoding.close());
	
	//Update regsitry
	promises.push(regsitry.deletePayload(this,private.stream));
	
	//We are closed
	private.isClosed = true;
	
	//Return all promises
	return Promise.all(promises);
};

module.exports = RTCEncoding;