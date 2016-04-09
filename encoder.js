var RTCCodecs = require("codecs.js");

var RTCEncoding = function(codec,parent,params)
{
	this.codec = codec;
	this.parent = parent;
	this.params = Object.create(params);
	this.subencodings = {}
};

RTCEncoding.prototype.send(stream)
{
	//Store send stream
	this.stream = stream;
	//update registry
	registry.add()
}

RTCEncoding.prototype.sendAll(stream)
{
	//Store send stream
	this.stream = stream;
	//Send all subencodngs recursive
	for(var subencoding: subencodings)
		subeconding.send();
	//update registry
	registry.add()
}


RTCEncoding.prototype.stop()
{
	//Stop sending
	delete(this.stream);
	//Stop all subencodngs recursive
	for(var subencoding: subencodings)
		subeconding.stop();
	//Update regsitry
	registry.delete();
}

RTCEncoding.prototype.addSubEncoding(params)
{
	subencodings[id] = new RTCEncoding(codec,this,params);
}

RTCEncoding.prototype.removeSubEncoding(subencoding)
{
	//Destroy it
	subencoding.stop();
	//Delete it from map
	delete(subencodings[subencoding.id]);
}

RTCEncoding.prototype.destroy()
{
	//Destroy all childs
	for (var subencoding: subencodings)
		subencoding.destroy();
}


var RTCEncoder = function(params)
{
	this.codec = codec;
	this.encodings = {};
	//Do we need to create a default encodor?
	if (params)
		addEncoding(params);
}

RTCEncoding.prototype.send(stream)
{
	//Send all encodings
	for (var encoding: encodings)
		//Send it
		encoding.sendAll(stream);
}

RTCEncoding.prototype.stop()
{
	//Stop sending
}

RTCEncoder.prototype.addEncoding(params)
{
	encodings[id] = new RTCEncoding(this,params);
}

RTCEncoder.prototype.removeEncoding(encoding)
{
	//Destroy encoding and subencodings
	encoding.destroy();
	//Delete it from map
	delete(encodings[encoding.id]);
}

var RTCEncoderFactory = function()
{
};


RTCEncoderFactory.proptype.create(codec,params)
{
	return new RTCEncoder(codec);
};

//create the factory
module.exports = new RTCEncoderFactory();
