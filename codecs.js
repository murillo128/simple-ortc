var RTCCodec = function(id,media,name,rate,channels)
{
	this.id       = id
	this.name     = name;
	this.media    = media;
	this.rate     = rate;
	this.channels = channels;
	
	Object.freeze(this);
}

var codecs = {};

//Add known codecs
codecs("pcmu")  = new RTCCodec("pcmu","pcmu","audio","8000","1");
codecs("pcma")  = new RTCCodec("pcma","pcma","audio","8000","1");
codecs("opus")  = new RTCCodec("opus","opus","audio","48000","2");

codecs("h264")  = new RTCCodec("h264","h264","video","90000");
codecs("vp8")  = new RTCCodec("vp8","vp8","video","90000");
codecs("vp9")  = new RTCCodec("vp9","vp9","video","90000");

Object.freeze(codecs);

module.exports = codecs;
