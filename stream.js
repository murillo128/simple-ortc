var RTCRtpStream = function(ssrc)
{
	this.muxId = undefined
}

RTCRtpStream.protype.attach(encoding,params)
{
	//Store change
  
	//Store
	this.encoding = encoding;
	this.pt = params.pt;
	this.rtx = params.rtx && Object.create(params.rtx);
}

RTCRtpStream.protype.dettach();
{
}

//Handle FEC

module.export = RTCRTPStream;
