var LFSR = require('lfsr');
 var registry = require("./registry.js");
//Create ramdon sequence generator
var generator = new LFSR(31, new Date().getTime(8));
 

//Private data
var privates = new WeakMap();
 
 
var RTCRtpSenderStream = function(params)
{
	//Private data
	var private = {
		muxId : undefined
	};
	//Store private in map
	privates.set(this,private);
	//Check ic ssrc was set
	if (params && params.ssrc)
		//Store it
		private.ssrc = params.ssrc;
	else
		//generate new one
		private.ssrc = generator.seq(31);
	//Check if we have rtx params
	if (params && params.rtx)
	{
		//Ensure rtx ssrc is not the same as current ssrc
		if (private.ssrc === params.rtx.ssrc)
			//Errror
			return Error("RTX ssrc can't be the same as media ssrc");
		//Copy valuess
		private.rtx =  { 
			ssrc : params.rtx.ssrc || generator.seq(31),
			time : params.rtx.time
		};
	} else
		//Set with defaults
		private.rtx =  { 
			ssrc : generator.seq(31)
		};
	
	//Define read only properties for rtx object
	Object.defineProperties(private.rtx, {
		ssrc: {
			value: private.rtx.ssrc,
			writable: false
		},
		time: {
			value:  private.rtx.time,
			writable: false
		}
	});
	//TODO: FEC
	
	//No transport
	private.transport = null;
	//Payload map
	private.payloads = {};
	
	//Define read only properties for main object
	Object.defineProperties(this, {
		muxId: {
			get: function() { 
				return private.muxId; 
			},
			set: function(muxId) {
				//Change it on the registry
				var promise = registry.setStreamMuxId(this,muxId);
				//Set it
				private.muxId = muxId;
				//Return primise
				return promise;
			}
		},
		ssrc: {
			value: private.ssrc,
			writable: false
		},
		rtx: {
			value: private.rtx,
			writable: false
		},
		payloads: {
			value: private.payloads,
			writable: false
		},
		trasnport: {
			value: private.trasnport,
			writable: false
		}
	});
};

RTCRtpSenderStream.prototype.addPayload = function(type,payload)
{
	//Get private data
	var private = privates.get(this);
	
	//Do we need to set it our own?
	if (type==="auto")
	{
		var found = false;
		//Check all
		for (var i = 96; i<128 && !found; i++)
			//Check if it is free and not reserved for rtcp
			if (i!==127 && !private.payloads[type])
			{
				//Got it
				type = i;
				//Exit
				found = true;
			}
		//Check if it has been found
		if (!found)
			//Err
			throw new Error("No more dynamic payloads available");
	} else
		//Check it was not already present
		if (private.payloads[type])
			//Error
			return new Error("Payload type already present in this stream");
	
	//Store change
	private.payloads[type] = payload;
};

RTCRtpSenderStream.prototype.deletePayload = function(type)
{
	//Get private data
	var private = privates.get(this);
	
	//Delete payload by type
	return delete(private.payloads[type]);
};

RTCRtpSenderStream.prototype.attach = function(transport)
{
	//Get private data
	var private = privates.get(this);
	
	//Attach
	var promise = registry.attachStream(this,transport);
	//Store change
	private.transport = transport;
	//Rertun primise
	return promise;
	
};

RTCRtpSenderStream.prototype.dettach = function()
{
	//Get private data
	var private = privates.get(this);
	
	//Attach
	var promise = registry.dettachStream(this);
	//Remove attachement
	private.transport = null;
	//Rertun primise
	return promise;
};

module.exports = RTCRtpSenderStream;
