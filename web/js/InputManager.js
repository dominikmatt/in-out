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

        let clipContainer = document.createElement('article');
        let clipLabel = document.createElement('p');
        let audio = document.createElement('audio');
        let deleteButton = document.createElement('button');

        clipContainer.classList.add('clip');
        audio.setAttribute('controls', '');
        deleteButton.innerHTML = "Delete";
        clipLabel.innerHTML = clipName;

        clipContainer.appendChild(audio);
        clipContainer.appendChild(clipLabel);
        clipContainer.appendChild(deleteButton);
        $('#sound-clips').append(clipContainer);

        console.log('BLOB', chunks);
        let blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
        chunks = [];
        let audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;

        deleteButton.onclick = function(e) {
            let evtTgt = e.target;
            evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
        };

        socket.connection.emit('event', );
    }
}

new InputManager();
