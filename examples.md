```javascript
var RTCCodecs = require("codecs.js");
var RTCEncoderFactory = require("encoder.js");
var RTCRtpSenderStream = require("stream.js");

//Media streams from gUM
var audio,video;
//ORTC transport
var transport;
```

Single codec single transport, autoassign values
```javascript
//Create h264 encoder
var encoder = RTCEncoderFactory.create(RTCCodec.h264);

//Set media stream source
encoder.setMediaStream(video);

//Create RTP strem and autoassign ssrc
var stream = new RTCRtpSenderStream();
console.log(stream.ssrc);
console.log(stream.rtx.ssrc);
console.log(stream.fec.ssrc);

//Send all encodings to the stream and autoasign payloads
encoder.send(stream);
console.log(stream.payloads[0].pt);
console.log(stream.payloads[0].rtx.pt);

//Send using transport
stream.send(transport);
``` 


Single codec single transport
```javascript
//Create h264 encoder
var encoder = RTCEncoderFactory.create(RTCCodec.h264);
//Set media stream source
encoder.setMediaStream(video);

//Create RTP strem and autoassign ssrc
var stream = new RTCRtpSenderStream();

//encoder must have only one encoding or it will throw an exception
encoder.encoodigns[0].send(stream,{pt: 100, rtx: {pt: 101}});

//Send using transport
stream.send(transport);
``` 

Multiple codecs, single transport
````javascript
//Create h264 and vp8 encoder
var encoder1 = RTCEncoderFactory.create(RTCCodec.h264);
var encoder2 = RTCEncoderFactory.create(RTCCodec.vp8);

//Set same source for both
encoder1.setMediaStream(video);
encoder2.setMediaStream(video);

//Create stream
var stream = new RTCRtpSenderStream();

stream.attach(encoder1,{pt: 100, rtx: {pt: 101}});
stream.attach(encoder2,{pt: 102, rtx: {pt: 103}});


stream.send(transport);
```

````javascript
//Simulcast codecs, single transport
var encoder1 = RTCEncoderFactory.create(RTCCodec.h264);
var encoder2 = RTCEncoderFactory.create(RTCCodec.vp8);

encoder.setMediaStream(video);

var stream = new RTCRtpSenderStream();

stream.attach(encoder1,{pt: 100, rtx: {pt: 101}});
stream.attach(encoder2,{pt: 102, rtx: {pt: 103}});


stream.send(transport);
```

