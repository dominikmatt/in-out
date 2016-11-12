'use strict';
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

/**
 * @class InputManager
 */
class InputManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext);

        this.startUserMedia();
    }

    /**
     * Connect to Media
     */
    startUserMedia() {
        navigator.getUserMedia(
            {
                audio:true
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
        let input = this.audioContext.createMediaStreamSource(stream);
        let volume = this.audioContext.createGain();

        volume.gain.value = 0.8;

        input.connect(volume);
        volume.connect(this.audioContext.destination);
    }
}

new InputManager();
