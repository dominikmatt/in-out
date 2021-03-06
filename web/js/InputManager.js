'use strict';
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

/**
 * @class InputManager
 */
class InputManager {
    constructor(ctx) {
      this.audioContext = ctx;

        setTimeout(function () {
            console.log('bind');
            this.startUserMedia();
            this.bindDomEvents();
        }.bind(this), 1000);
    }

    bindDomEvents() {
        $('#record').on('click', this.handleRecord.bind(this));
        $('#stop').on('click', this.handleStop.bind(this));
        $('#get-file').on('click', this.handleGetFiles.bind(this));
        $('#delete-file').on('click', this.handleDeleteFile.bind(this));
        $('#monitorvolume').on('change', this.handleMonitorVolume.bind(this));
    }

    handleMonitorVolume(event) {
        this.volume.gain.value = event.target.value;
    }

    /**
     * Handles click on record button.
     */
    handleRecord() {
        console.log('lol');
        if (this.mediaRecorder) {

            this.mediaRecorder.start();
            console.log(this.mediaRecorder.state);
            console.log("recorder started");
        }
    }

    /**
     * Handles click on stop button.
     */
    handleStop() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            console.log(this.mediaRecorder.state);
            console.log("recorder stopped");
        }
    }

    /**
     * Handles click on get files button.
     */
    handleGetFiles() {
        socket.connection.emit('file.get');
    }

    /**
     * Handles click on remove file button.
     */
    handleDeleteFile() {
        socket.connection.emit('file.remove', {fileName: 'x1.ogg'});
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
        this.volume = this.audioContext.createGain();

        this.volume.gain.value = 0.8;

        input.connect(this.volume);
        this.volume.connect(this.audioContext.destination);
    }

    /**
     * Handler if mediaRecorder is stopped.
     *
     * @param {Array} chunks
     */
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
