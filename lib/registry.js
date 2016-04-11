// process.env.DEBUG = "*";
var debug = require("debug")("simple-ortc:registry");
var asap = require('asap');

/*
 * This is the magic objects that generates all the rtpsenders 
 

        <track,encoding,transport>

	RTPSender(track,transport)
	+--streams
	    +--payloads
	    +--encodings


<sender> => transport
<sender> => track
<transport,ssrc> => sender



<ssrc> => stream
<stream> => transport

<stream> => sender

<encoding,stream>  => payload


<track,transport,stream,encoding> <=> payload

payload => sender

sender => [payloads]
*/

function getStreamSender(stream) {
	
}

function updateSender(sender,resolveWith){
	return Promise.resolve(resolveWith);
};

function createSender(sender) {
	
}

var RTCRtpStreamPayload = function(encoding,stream,params)
{
	this.encoding = encoding;
	this.track = encoding.encoder.track;
	this.stream = stream;
	this.transport = stream.transport;
	this.sender = null;
	this.active = true;
	this.params = Object.assign({},params);
};


var pending = false;

var created = [];
var dirty = [];
var deleted = [];



/*****************
 * MediaStreamTrack.id
 *  +--RTCDtlsParameters
 *  +--RTCDtlsParameters
 *     +---RTCRtpSender
 *     +---RTCRtpSender
 *         +---RTCRtpStreams
 *	   +---RTCRtpStreams
 *	       +---RTCEncodings
 */
var tree = {};


function getRtpSenders(track,transport)
{
	//Get transport map
	var transports = tree[track.id];
	//
	return transports || transport[transport];
}

function addRtpSender(track,transport,sender)
{
	//Get transport map
	var transports = tree[track.id];
	//IF it doesn't exist
	if (!transport)
		//Create one
		transports = tree[track.id] = new WeakMap();
	//Add it
	(transports[transport] || (transports[transport] = new WeakMap())).push(sender);
}

function flush() {
	debug("Flush [created:%d,dirty:%d,deleted:%d]",created.length,dirty.length,deleted.length);
	//Fore ecah created payload
	for (var i=0;i<created.length;i++)
	{
		debug(created[i]);
		//Get payload
		var payload = created[i].payload;
		//Resolve it
		created[i].resolve(payload);
	}
	//Clear created
	created = [];
	
	//For each modified payload
	for (var i=0;i<dirty.length;i++)
	{
		debug(dity[i]);
		//Get payload
		var payload = dity[i].payload;
		//Resolve it
		dity[i].resolve(payload);
	}
	//Clear dirty
	dity = [];
	//For each deleted payload
	for (var i=0;i<deleted.length;i++)
	{
		debug(deleted[i]);
		//Get payload
		var payload = deleted[i].payload;
		//Resolve it
		deleted[i].resolve(payload);
	}
	//Clear
	deleted = [];
	//Done
	pending = false;
	debug("Flushed");
}

function requestFlush() {
	//IF not pending 
	if (!pending)
	{
		debug("Requesting flush asap");
		asap(flush);
		pending = true;
	}
}

module.exports = {
	setEncoderTrack: function (encoder,track)
	{
		//Is it the first time?
		if (!encoder.track)
		{
				
		} else {
			//Get all senders for each encoding of the encoder
			//For each sender change the track
		}
	},
	setStreamMuxId: function (stream,muxId)
	{
		
	},
	addPayload: function(encoding,stream,params)
	{
		debug("addPayload [encoding:%o,stream:%o,params:%o]",encoding,stream,params);
		//Create payload
		var payload = new RTCRtpStreamPayload(encoding,stream,params);
		//Get payload type
		var payloadType = params && params.payloadType ? params.payloadType : "auto";
		//Add payload to stream
		stream.addPayload(payloadType,payload);
		
		//Create new promise
		return new Promise(function(resolve,reject){
			//Check if the associated payload has a track already defined and the stream has a transport
			if (encoding.track && stream.transport)
			{
				//Mark payload as dirty
				created.push({
					payload: payload,
					resolve: resolve,
					reject: reject,
					from: "addPayload"
				});
				//require flush
				requestFlush();
			} else
				//Resolve it now
				resolve(payload);
		});
	},
	pausePayload: function(payload,flag)
	{
		//Flag 
		payload.active = !flag;
		
		//Create new promise
		return new Promise(function(resolve,reject){
			//Check if the associated payload has a track already defined
			if (payload.encoding.track)
			{
				//Mark payload as dirty
				dirty.push({
					payload: payload,
					resolve: resolve,
					reject: reject,
					from: "pausePayload"
				});
				//require flush
				requestFlush();
			}
			else
				//Resolve it now
				resolve(payload);
		});
	},
	deletePayload: function(stream,payload)
	{
		//Delete it
		stream.deletePayload(payload);
		
		//Create new promise
		return new Promise(function(resolve,reject){
			//Check if it was already created
			if (payload.track && payload.transport)
			{
				//Mark payload as dirty
				deleted.push({
					payload: payload,
					resolve: resolve,
					reject: reject,
					from: "deletePayload"
				});
				//require flush
				requestFlush();
			} else
				//Resolve it now
				resolve(payload);
		});
	},
	attachStream: function(stream,transport)
	{
		debug("attachStream [stream:%o,transport:%o]",stream,transport);
		
		//Promises array
		var promises = [];
		
		//For each payload type
		for (var type in stream.payloads)
		{
			//Get payload
			var payload = stream.payloads[type];

			//Check if the associated payload has a track already defined
			if (payload.track)
			{
				//Create new promise
				promises.push(new Promise(function(resolve,reject){
					if (payload.transport)
						//Mark payload as dirty
						dirty.push({
							payload: payload,
							resolve: resolve,
							reject: reject,
							from: "attachStream"
						});
					else 
						//Mark payload as dirty
						created.push({
							payload: payload,
							resolve: resolve,
							reject: reject,
							from: "attachStream"
						});
				}));
				//require flush
				requestFlush();
			}
			//Set new payload
			payload.transport = transport;
		}
		
		//All promises
		return Promise.all(promises);
	},
	dettachStream: function(stream)
	{
		debug("dettachStream [stream:%o]",stream);

		
		//Promises array
		var promises = [];
		
		//For each payload type
		for (var type in stream.payloads)
		{
			//Get payload
			var payload = stream.payloads[type];

			//Check if the associated payload has a track already defined
			if (payload.track)
			{
				//Create new promise
				promises.push(new Promise(function(resolve,reject){
					//Mark payload as dirty
					deleted.push({
						payload: payload,
						resolve: resolve,
						reject: reject,
						from: "dettachStream"
					});
				}));
				//require flush
				requestFlush();
			}
			//Set new payload
			delete(payload.transport);
		}
		//All promises
		return Promise.all(promises);
	}
};

