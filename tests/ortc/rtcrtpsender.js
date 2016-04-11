//ORTC sender shim for testing

function RTCRtpSender (track,transport,rtcpTransport)
{
	this.track = track;
	this.transport = transport;
	this.rtcpTransport = rtcpTransport;
	//Define read only properties
	Object.defineProperties(this, {
		track: {
			value: track,
			writable: false
		},
		transport: {
			value: transport,
			writable: false
		},
		rtcpTransport: {
			value: rtcpTransport,
			writable: false
		}
	});
}

//Static
RTCRtpSender.getCapabities = function()
{
	return {
		codecs: [
			
		],
		fecMechanisms : [
			"red",
			"red+ulpfec",
			"flexfec"
		],
		headerExtensions : [
			
		]
	};
};

RTCRtpSender.prototype.send = function(params) {
	this.params = params;
};

RTCRtpSender.prototype.stop = function(params) {
	this.params = null;
};

module.exports = RTCRtpSender;