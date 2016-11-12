'use strict';
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

/**
 * @class InputManager
 */
class InputManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext);

        this.startUserMedia();
        this.bindDomEvents();
    }

    bindDomEvents() {
        $('#record').on('click', this.handleRecord.bind(this));

        $('#stop').on('click', this.handleStop.bind(this));
        $('#get-file').on('click', this.handleGetFiles.bind(this));
    }

    handleRecord() {
        if (this.mediaRecorder) {

            this.mediaRecorder.start();
            console.log(this.mediaRecorder.state);
            console.log("recorder started");
        }
    }

    handleStop() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            console.log(this.mediaRecorder.state);
            console.log("recorder stopped");
        }
    }

    handleGetFiles() {
        socket.connection.emit('file.get');
    }

    /**
     * Connect to Media
     */
    startUserMedia() {
        navigator.getUserMedia(
            {
                audio: true
            },
            this.onUserMediaFound.bind(this),
            (error) => {
                console.error('No live audio input ' + error);
            }
        );
    }

    /**
     * Called after Media is found.
     *
     * @param {MediaStream} stream
     */
    onUserMediaFound(stream) {
        this.mediaRecorder = new MediaRecorder(stream);
        let chunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
        };

        this.mediaRecorder.onstop = this.onStopHandler.bind(null, chunks);

        let input = this.audioContext.createMediaStreamSource(stream);
        let volume = this.audioContext.createGain();

        volume.gain.value = 0.8;

        input.connect(volume);
        volume.connect(this.audioContext.destination);
    }

    onStopHandler(chunks) {
        let clipName = prompt('Enter a name for your sound clip');

        let blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});

        socket.connection.emit('file.upload', {
            buffer: blob,
            name: clipName
        });
    }
}

new InputManager();
