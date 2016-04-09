```javascript
var RTCCodecs = require("codecs.js");
var RTCEncoderFactory = require("encoder.js");
var RTCRtpStream = require("stream.js");

//Media streams from gUM
var audio,video;
//ORTC transport
var transport;
```javascript


```javascript
//Single codec single transport, autoassign ssrc, pt
var encoder = RTCEncoderFactory.create(RTCCodec.h264);

encoder.setMediaStream(video);

var stream = new RTCRtpStream();
console.log(stream.ssrc);

stream.attach(encoder.encodings[0]);
console.log(stream.payloads[0].pt);

stream.send(transport);
``` 

```javascript
//Single codec single transport
var encoder = RTCEncoderFactory.create(RTCCodec.h264);

encoder.setMediaStream(video);

var stream = new RTCRtpStream();

//encoder must have only one encoding or it will throw an exception
stream.attach(encoder,{pt: 100, rtx: {pt: 101}});

stream.send(transport);
``` 

````javascript
//Multiple codecs, single transport
var encoder1 = RTCEncoderFactory.create(RTCCodec.h264);
var encoder2 = RTCEncoderFactory.create(RTCCodec.vp8);

encoder.setMediaStream(video);

var stream = new RTCRtpStream();

stream.attach(encoder1,{pt: 100, rtx: {pt: 101}});
stream.attach(encoder2,{pt: 102, rtx: {pt: 103}});


stream.send(transport);
```

````javascript
//Simulcast codecs, single transport
var encoder1 = RTCEncoderFactory.create(RTCCodec.h264);
var encoder2 = RTCEncoderFactory.create(RTCCodec.vp8);

encoder.setMediaStream(video);

var stream = new RTCRtpStream();

stream.attach(encoder1,{pt: 100, rtx: {pt: 101}});
stream.attach(encoder2,{pt: 102, rtx: {pt: 103}});


stream.send(transport);
```

