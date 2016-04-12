process.env.DEBUG = "*";
var test = require('tape');
var debug = require("debug")("simple-ortc:test");

//Put ORT shims into global
global.RTCRtpSender = require("./ortc/rtcrtpsender.js");

//Load SimpleORTC objects into global
global.RTCCodec = require('../lib/codecs.js');
global.RTCEncoderFactory = require('../lib/encoder.js');
global.RTCRtpSenderStream = require('../lib/stream.js');

//Dummy objects used for tests
//Media streams from gUM
var audio = {audio:true};
var video = {video:true};
//ORTC transport
var transport = {transport:true};


test('Simple test secuential then', function (t) {

	t.plan(4);

	//Create h264 encoder
	var encoder = RTCEncoderFactory.create(RTCCodec.h264);

	//Set media stream source
	encoder.track = video;

	//Create RTP strem and autoassign ssrc
	var stream = new RTCRtpSenderStream();

	//Send all encodings to the stream and autoasign payloads
	encoder.send(stream)
		.then(function(payload){
			//debug(payload);
			t.equals(payload.stream,stream);
			t.equals(payload.track,video);
			//Send using transport
			return stream.attach(transport);
		})
		.then(function(payload){
			debug("attached %o",payload);
			t.equal(payload[0].transport,transport);
			//Stop sending
			return stream.dettach();
		})
		.then(function(payload){
			debug("dettached %o",payload);
			t.equal(payload.transport,undefined);
		})
		.catch(function(error){
			debug("Error: %o",error);
			t.fail(error);
		});
});

test('Simple test mix secuential then', function (t) {

	t.plan(4);

	//Create h264 encoder
	var encoder = RTCEncoderFactory.create(RTCCodec.h264);

	//Set media stream source
	encoder.track = video;

	//Create RTP strem and autoassign ssrc
	var stream = new RTCRtpSenderStream();

	//Send all encodings to the stream and autoasign payloads
	encoder.send(stream)
		.then(function(payload){
			//debug(payload);
			t.equals(payload.stream,stream);
			t.equals(payload.track,video);
		})
		.catch(function(error){
			debug("Error: %o",error);
			t.fail(error);
		});

	//Send using transport
	stream.attach(transport)
		.then(function(payload){
			debug("attached %o",payload);
			t.equal(payload[0].transport,transport);
			return stream.dettach();
		})
		.then(function(payload){
			debug("dettached %o",payload);
			t.equal(payload.transport,undefined);
		})
		.catch(function(error){
			debug("Error: %o",error);
			t.fail(error);
		});
});

test('Simple test parallel then', function (t) {

	t.plan(4);

	//Create h264 encoder
	var encoder = RTCEncoderFactory.create(RTCCodec.h264);

	//Set media stream source
	encoder.track = video;

	//Create RTP strem and autoassign ssrc
	var stream = new RTCRtpSenderStream();

	//Send all encodings to the stream and autoasign payloads
	Promise.all([
		encoder.send(stream),
		stream.attach(transport)
	])
	.then(function(payload){
		debug("attached & sending %o",payload);
		t.equals(payload[0].stream,stream);
		t.equals(payload[0].track,video);
		t.equal(payload[0].transport,transport);
		return stream.dettach();
	})
	.then(function(payload){
		debug("dettached %o",payload);
		t.equal(payload.transport,undefined);
	})
	.catch(function(error){
		debug("Error: %o",error);
		t.fail(error);
	});
		
		
	
});