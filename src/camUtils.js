function httpGetAsync(theUrl, callback) {
    try {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                callback(xmlHttp.responseText);
            }
        };
        xmlHttp.open("GET", theUrl, true); // true for asynchronous
        xmlHttp.send(null);
    } catch (e) {
        console.error(e);
    }
}

function addGyronormScript() {
    var srcUrl = "https://rawgit.com/dorukeker/gyronorm.js/master/dist/gyronorm.complete.min.js"
    httpGetAsync(srcUrl, function (text) {
        var script = document.createElement("script");
        script.setAttribute("src", srcUrl);
        document.getElementsByTagName("head")[0].appendChild(script);
    });
}

var signalling_server_hostname = "192.168.86.71";
var signalling_server_address = signalling_server_hostname + ':80';
var isFirefox = typeof InstallTrigger !== 'undefined';// Firefox 1.0+

var ws = null;
var pc;
var gn;
var datachannel, localdatachannel;
var audio_video_stream;
var recorder = null;
var recordedBlobs;
var pcConfig = {"iceServers": [
        {"urls": ["stun:stun.l.google.com:19302", "stun:" + signalling_server_hostname + ":3478"]}
    ]};
var pcOptions = {
    optional: [
        // Deprecated:
        //{RtpDataChannels: false},
        //{DtlsSrtpKeyAgreement: true}
    ]
};
var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};
var keys = [];

RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;
var URL = window.URL || window.webkitURL;

function createPeerConnection() {
    try {
        var pcConfig_ = pcConfig;
        console.log(JSON.stringify(pcConfig_));
        pc = new RTCPeerConnection(pcConfig_, pcOptions);
        pc.onicecandidate = onIceCandidate;
        pc.onaddstream = onRemoteStreamAdded;
        pc.onremovestream = onRemoteStreamRemoved;
        pc.ondatachannel = onDataChannel;
        console.log("peer connection successfully created!");
    } catch (e) {
        console.error("createPeerConnection() failed");
    }
}

function onDataChannel(event) {
    console.log("onDataChannel()");
    datachannel = event.channel;

    event.channel.onopen = function () {
        console.log("Data Channel is open!");
    };

    event.channel.onerror = function (error) {
        console.error("Data Channel Error:", error);
    };

    event.channel.onmessage = function (event) {
        console.log("Got Data Channel Message:", event.data);
        document.getElementById('datareceived').value = event.data;
    };

    event.channel.onclose = function () {
        datachannel = null;
        document.getElementById('datachannels').disabled = true;
        console.log("The Data Channel is Closed");
    };
}

function onIceCandidate(event) {
    if (event.candidate) {
        var candidate = {
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        };
        var request = {
            what: "addIceCandidate",
            data: JSON.stringify(candidate)
        };
        ws.send(JSON.stringify(request));
    } else {
        console.log("End of candidates.");
    }
}

function onRemoteStreamAdded(event) {
    console.log('*****event coming*****')
    console.log(event)
    var remoteVideoElement = document.getElementById('remote-video');
    remoteVideoElement.srcObject = event.stream;
    remoteVideoElement.play();
    if (remoteVideoElement.mozRequestFullScreen) {
      remoteVideoElement.mozRequestFullScreen();
    } else if (remoteVideoElement.webkitRequestFullscreen) {
      remoteVideoElement.webkitRequestFullscreen();
    } else if (remoteVideoElement.requestFullscreen) {
      remoteVideoElement.requestFullscreen();
    }
}

function onRemoteStreamRemoved(event) {
    var remoteVideoElement = document.getElementById('remote-video');
    remoteVideoElement.src = '';
}

function start() {
    if ("WebSocket" in window) {
        document.documentElement.style.cursor = 'wait';
        var server = "192.168.86.71:8160";

        var protocol = "ws:";
        ws = new WebSocket(protocol + '//' + server + '/stream/webrtc');

        function call(stream) {
            createPeerConnection();
            if (stream) {
                pc.addStream(stream);
            }
            var request = {
                what: "call",
                options: {
                    force_hw_vcodec: false,
                    vformat: '60'
                }
            };
            ws.send(JSON.stringify(request));
            console.log("call(), request=" + JSON.stringify(request));
        }

        ws.onopen = function () {
            console.log("onopen()");

            audio_video_stream = null;
            var cast_mic = false;
            var cast_tab = false;
            var cast_camera = false;
            var cast_screen = false;
            var cast_window = false;
            var cast_application = false;
            var echo_cancellation = false;
            var localConstraints = {};
            if (cast_mic) {
                if (echo_cancellation)
                    localConstraints['audio'] = isFirefox ? {echoCancellation: true} : {optional: [{echoCancellation: true}]};
                else
                    localConstraints['audio'] = isFirefox ? {echoCancellation: false} : {optional: [{echoCancellation: false}]};
            } else if (cast_tab) {
                localConstraints['audio'] = {mediaSource: "audioCapture"};
            } else {
                localConstraints['audio'] = false;
            }
            if (cast_camera) {
                localConstraints['video'] = true;
            } else if (cast_screen) {
                if (isFirefox) {
                    localConstraints['video'] = {frameRate: {ideal: 15, max: 30},
                        //width: {min: 640, max: 960},
                        //height: {min: 480, max: 720},
                        mozMediaSource: "screen",
                        mediaSource: "screen"};
                } else {
                    // chrome://flags#enable-usermedia-screen-capturing
                    document.getElementById("cast_mic").checked = false;
                    localConstraints['audio'] = false; // mandatory for chrome
                    localConstraints['video'] = {'mandatory': {'chromeMediaSource':'screen'}};
                }
            } else if (cast_window)
                localConstraints['video'] = {frameRate: {ideal: 15, max: 30},
                    //width: {min: 640, max: 960},
                    //height: {min: 480, max: 720},
                    mozMediaSource: "window",
                    mediaSource: "window"};
            else if (cast_application)
                localConstraints['video'] = {frameRate: {ideal: 15, max: 30},
                    //width: {min: 640, max: 960},
                    //height:  {min: 480, max: 720},
                    mozMediaSource: "application",
                    mediaSource: "application"};
            else
                localConstraints['video'] = false;

            var localVideoElement = document.getElementById('local-video');
            if (localConstraints.audio || localConstraints.video) {
                if (navigator.getUserMedia) {
                    navigator.getUserMedia(localConstraints, function (stream) {
                        audio_video_stream = stream;
                        call(stream);
                        localVideoElement.muted = true;
                        localVideoElement.src = URL.createObjectURL(stream);
                        localVideoElement.play();
                    }, function (error) {
                        stop();
                        alert("An error has occurred. Check media device, permissions on media and origin.");
                        console.error(error);
                    });
                } else {
                    console.log("getUserMedia not supported");
                }
            } else {
                call();
            }
        };

        ws.onmessage = function (evt) {
            var msg = JSON.parse(evt.data);
            if (msg.what !== 'undefined') {
                var what = msg.what;
                var data = msg.data;
            } else { /* TODO: for backward compatibility, remove this branch in the future */
                var what = msg.type;
                var data = msg; // only used for 'offer' in the switch case below
                console.log("still using the old API?");
            }
            //console.log("message=" + msg);
            console.log("message =" + what);

            switch (what) {
                case "offer":
                    pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)),
                            function onRemoteSdpSuccess() {
                                console.log('onRemoteSdpSucces()');
                                pc.createAnswer(function (sessionDescription) {
                                    pc.setLocalDescription(sessionDescription);
                                    var request = {
                                        what: "answer",
                                        data: JSON.stringify(sessionDescription)
                                    };
                                    ws.send(JSON.stringify(request));
                                    console.log(request);

                                }, function (error) {
                                    alert("Failed to createAnswer: " + error);

                                }, mediaConstraints);
                            },
                            function onRemoteSdpError(event) {
                                alert('Failed to set remote description (unsupported codec on this browser?): ' + event);
                                stop();
                            }
                    );

                    var request = {
                        what: "generateIceCandidates"
                    };
                    console.log(request);
                    ws.send(JSON.stringify(request));
                    break;

                case "answer":
                    break;

                case "message":
                    alert(msg.data);
                    break;

                case "geticecandidate": // TODO: remove
                case "iceCandidates":
                    var candidates = JSON.parse(msg.data);
                    for (var i = 0; candidates && i < candidates.length; i++) {
                        var elt = candidates[i];
                        let candidate = new RTCIceCandidate({sdpMLineIndex: elt.sdpMLineIndex, candidate: elt.candidate});
                        pc.addIceCandidate(candidate,
                                function () {
                                    console.log("IceCandidate added: " + JSON.stringify(candidate));
                                },
                                function (error) {
                                    console.error("addIceCandidate error: " + error);
                                }
                        );
                    }
                    document.documentElement.style.cursor = 'default';
                    break;
            }
        };

        ws.onclose = function (evt) {
            if (pc) {
                pc.close();
                pc = null;
            }
            document.documentElement.style.cursor = 'default';
        };

        ws.onerror = function (evt) {
            alert("An error has occurred!");
            ws.close();
        };

    } else {
        alert("Sorry, this browser does not support WebSockets.");
    }
}

function stop() {
    if (datachannel) {
        console.log("closing data channels");
        datachannel.close();
        datachannel = null;
        document.getElementById('datachannels').disabled = true;
    }
    if (localdatachannel) {
        console.log("closing local data channels");
        localdatachannel.close();
        localdatachannel = null;
    }
    if (audio_video_stream) {
        try {
            audio_video_stream.stop();
        } catch (e) {
            for (var i = 0; i < audio_video_stream.getTracks().length; i++)
                audio_video_stream.getTracks()[i].stop();
        }
        audio_video_stream = null;
    }
    stop_record();
    document.getElementById('remote-video').src = '';
    document.getElementById('local-video').src = '';
    if (pc) {
        pc.close();
        pc = null;
    }
    if (ws) {
        ws.close();
        ws = null;
    }
    document.getElementById("stop").disabled = true;
    document.getElementById("start").disabled = false;
    document.documentElement.style.cursor = 'default';
}

function mute() {
    var remoteVideo = document.getElementById("remote-video");
    remoteVideo.muted = !remoteVideo.muted;
}

function pause() {
    var remoteVideo = document.getElementById("remote-video");
    if (remoteVideo.paused)
        remoteVideo.play();
    else
        remoteVideo.pause();
}

function fullscreen() {
    var remoteVideo = document.getElementById("remote-video");
    if (remoteVideo.requestFullScreen) {
        remoteVideo.requestFullScreen();
    } else if (remoteVideo.webkitRequestFullScreen) {
        remoteVideo.webkitRequestFullScreen();
    } else if (remoteVideo.mozRequestFullScreen) {
        remoteVideo.mozRequestFullScreen();
    }
}

function handleDataAvailable(event) {
    //console.log(event);
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

function handleStop(event) {
    console.log('Recorder stopped: ', event);
    document.getElementById('record').innerHTML = 'Start Recording';
    recorder = null;
    var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    var recordedVideoElement = document.getElementById('recorded-video');
    recordedVideoElement.src = URL.createObjectURL(superBuffer);
}

function discard_recording() {
    var recordedVideoElement = document.getElementById('recorded-video');
    recordedVideoElement.src = '';
}

function stop_record() {
    if (recorder) {
        recorder.stop();
        console.log("recording stopped");
        document.getElementById('record-detail').open = true;
    }
}

function startRecording(stream) {
    recordedBlobs = [];
    var options = {mimeType: 'video/webm;codecs=vp9'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: 'video/webm;codecs=vp8'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log(options.mimeType + ' is not Supported');
            options = {mimeType: 'video/webm;codecs=h264'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.log(options.mimeType + ' is not Supported');
                options = {mimeType: 'video/webm'};
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.log(options.mimeType + ' is not Supported');
                    options = {mimeType: ''};
                }
            }
        }
    }
    try {
        recorder = new MediaRecorder(stream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder: ' + e);
        alert('Exception while creating MediaRecorder: ' + e + '. mimeType: ' + options.mimeType);
        return;
    }
    console.log('Created MediaRecorder', recorder, 'with options', options);
    //recorder.ignoreMutedMedia = true;
    recorder.onstop = handleStop;
    recorder.ondataavailable = handleDataAvailable;
    recorder.onwarning = function (e) {
        console.log('Warning: ' + e);
    };
    recorder.start();
    console.log('MediaRecorder started', recorder);
}

function start_stop_record() {
    if (pc && !recorder) {
        var streams = pc.getRemoteStreams();
        if (streams.length) {
            console.log("starting recording");
            startRecording(streams[0]);
            document.getElementById('record').innerHTML = 'Stop Recording';
        }
    } else {
        stop_record();
    }
}

function download() {
    if (recordedBlobs !== undefined) {
        var blob = new Blob(recordedBlobs, {type: 'video/webm'});
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'video.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
}

function remote_hw_vcodec_selection() {
    if (!document.getElementById('remote_hw_vcodec').checked)
        unselect_remote_hw_vcodec();
    else
        select_remote_hw_vcodec();
}

function remote_hw_vcodec_format_selection() {
    if (document.getElementById('remote_hw_vcodec').checked)
        remote_hw_vcodec_selection();
}

function select_remote_hw_vcodec() {
    document.getElementById('remote_hw_vcodec').checked = true;
    var vformat = document.getElementById('remote_vformat').value;
    switch (vformat) {
        case '10':
            document.getElementById('remote-video').style.width = "320px";
            document.getElementById('remote-video').style.height = "240px";
            break;
        case '20':
            document.getElementById('remote-video').style.width = "352px";
            document.getElementById('remote-video').style.height = "288px";
            break;
        case '30':
            document.getElementById('remote-video').style.width = "640px";
            document.getElementById('remote-video').style.height = "480px";
            break;
        case '35':
            document.getElementById('remote-video').style.width = "800px";
            document.getElementById('remote-video').style.height = "480px";
            break;
        case '40':
            document.getElementById('remote-video').style.width = "960px";
            document.getElementById('remote-video').style.height = "720px";
            break;
        case '50':
            document.getElementById('remote-video').style.width = "1024px";
            document.getElementById('remote-video').style.height = "768px";
            break;
        case '55':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "720px";
            break;
        case '60':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "720px";
            break;
        case '63':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "720px";
            break;
        case '65':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "768px";
            break;
        case '70':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "768px";
            break;
        case '80':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "960px";
            break;
        case '90':
            document.getElementById('remote-video').style.width = "1600px";
            document.getElementById('remote-video').style.height = "768px";
            break;
        case '95':
            document.getElementById('remote-video').style.width = "1640px";
            document.getElementById('remote-video').style.height = "1232px";
            break;
        case '97':
            document.getElementById('remote-video').style.width = "1640px";
            document.getElementById('remote-video').style.height = "1232px";
            break;
        case '100':
            document.getElementById('remote-video').style.width = "1920px";
            document.getElementById('remote-video').style.height = "1080px";
            break;
        case '105':
            document.getElementById('remote-video').style.width = "1920px";
            document.getElementById('remote-video').style.height = "1080px";
            break;
        default:
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "720px";
    }
    /*
     // Disable video casting. Not supported at the moment with hw codecs.
     var elements = document.getElementsByName('video_cast');
     for(var i = 0; i < elements.length; i++) {
     elements[i].checked = false;
     }
     */
}

function unselect_remote_hw_vcodec() {
    document.getElementById('remote_hw_vcodec').checked = false;
    document.getElementById('remote-video').style.width = "640px";
    document.getElementById('remote-video').style.height = "480px";
}

function singleselection(name, id) {
    var old = document.getElementById(id).checked;
    var elements = document.getElementsByName(name);
    for (var i = 0; i < elements.length; i++) {
        elements[i].checked = false;
    }
    document.getElementById(id).checked = old ? true : false;
    /*
     // Disable video hw codec. Not supported at the moment when casting.
     if (name === 'video_cast') {
     unselect_remote_hw_vcodec();
     }
     */
}

function send_message() {
    var msg = document.getElementById('datamessage').value;
    datachannel.send(msg);
    console.log("message sent: ", msg);
}

function create_localdatachannel() {
    if (pc && localdatachannel)
        return;
    localdatachannel = pc.createDataChannel('datachannel');
    localdatachannel.onopen = function(event) {
        if (localdatachannel.readyState === "open") {
            localdatachannel.send("datachannel created!");
        }
    };
    console.log("data channel created");
}

function close_localdatachannel() {
    if (localdatachannel) {
        localdatachannel.close();
        localdatachannel = null;
    }
    console.log("local data channel closed");
}

function handleOrientation(event) {
    var data = {
        "do": {
            "alpha": event.alpha.toFixed(1), // In degree in the range [0,360]
            "beta": event.beta.toFixed(1), // In degree in the range [-180,180]
            "gamma": event.gamma.toFixed(1), // In degree in the range [-90,90]
            "absolute": event.absolute
        }
    };
    if (datachannel)
        datachannel.send(JSON.stringify(data));
}

function isGyronormPresent() {
    var url = "gyronorm.complete.min.js";
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length; i--; ) {
        if (scripts[i].src.indexOf(url) > -1)
            return true;
    }
    return false;
}

function handleGyronorm(data) {
    // Process:
    // data.do.alpha    ( deviceorientation event alpha value )
    // data.do.beta     ( deviceorientation event beta value )
    // data.do.gamma    ( deviceorientation event gamma value )
    // data.do.absolute ( deviceorientation event absolute value )

    // data.dm.x        ( devicemotion event acceleration x value )
    // data.dm.y        ( devicemotion event acceleration y value )
    // data.dm.z        ( devicemotion event acceleration z value )

    // data.dm.gx       ( devicemotion event accelerationIncludingGravity x value )
    // data.dm.gy       ( devicemotion event accelerationIncludingGravity y value )
    // data.dm.gz       ( devicemotion event accelerationIncludingGravity z value )

    // data.dm.alpha    ( devicemotion event rotationRate alpha value )
    // data.dm.beta     ( devicemotion event rotationRate beta value )
    // data.dm.gamma    ( devicemotion event rotationRate gamma value )
    if (datachannel && document.getElementById('orientationsend').checked)
        datachannel.send(JSON.stringify(data));
}

export default start;
