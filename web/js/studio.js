'use strict';

const dev = navigator.mediaDevices;

class Mixer {

  constructor(ctx) {
    this.ctx = ctx;
    this.tracks = {};
    this.masterGain = ctx.createGain();
    this.masterGain.connect(ctx.destination);
  }

  setVolume(vol) {
    this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
  }

  addTrack(id, track) {
    this.tracks[id] = track;
    track.connect(this.masterGain);
  }

  removeTrack(id) {
    delete this.tracks[id];
    track.disconnect(this.masterGain);
  }

  play() {
    for (var t in this.tracks) {
      this.tracks[t].start();
    }
  }

}


class Track {

  constructor(ctx, url, name) {
    this.name = name;
    this.pan = new Pan(ctx);
    this.volume = new Volume(ctx);
    this.source = new AudioTrack(ctx, url);
    this.source.connect(this.volume.node);
    this.volume.connect(this.pan.node);
  }

  init() {
    return this.source.load();
  }

  start() {
    this.source.start();
  }

  setVolume(v) {
    this.volume.set(v);
  }

  getVolume() {
    return this.volume.value();
  }

  setPan(v) {
    this.pan.set(v);
  }

  getPan() {
    return this.pan.value();
  }

  toggleMute() {
    this.volume.mute();
  }

  connect(node) {
    this.pan.connect(node);
  }

}


class BufferLoader {

  constructor(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.callback = callback;
    this.bufferList = new Array(urlList.length);
    this.loadCount = 0;
  }

  load() {
    for (var i = 0; i < this.urlList.length; ++i) {
      this.loadBuffer(this.urlList[i], i);
    }
  }

  loadBuffer(url, idx) {
    // Load buffer asynchronously
    var loader = this;
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = (e) => {
      // Asynchronously decode the audio file data in request.response
      loader.context.decodeAudioData(
        request.response,
        (buffer) => {
          if (!buffer) {
            console.error('error decoding file data: ' + url);
            return;
          }
          loader.bufferList[idx] = buffer;
          if (++loader.loadCount == loader.urlList.length) {
            loader.callback(loader.bufferList);
          }
        },
        console.error
      );
    };
    request.onerror = console.error;
    request.send();
  }

}


class AudioTrack {

  constructor(ctx, url) {
    this.ctx = ctx;
    this.url = url;
    this.node = ctx.createBufferSource();
    this.node.loop = true;
    this.ready = false;
  }

  callbackFactory(self, resolve, reject) {
    return (buffers) => {
      console.log('finished', buffers);
      self.node.buffer = buffers[0];
      self.ready = true;
      resolve(true);
    }
  }

  load() {
    var self = this;
    return new Promise((resolve, reject) => {
      var loader = new BufferLoader(this.ctx, [this.url], this.callbackFactory(this, resolve, reject));
      loader.load();
    });
  }

  connect(node) {
    this.node.connect(node);
  }

  start() {
    if (!this.ready) return;
    this.node.start();
  }

}


class Volume {

  constructor(ctx) {
    this.ctx = ctx;
    this.node = ctx.createGain();
    this.lastValue = null;
  }

  set(v) {
    this.node.gain.setValueAtTime(v, this.ctx.currentTime);
  }

  value() {
    return this.node.gain.value;
  }

  mute() {
    if (this.lastValue) {
      this.node.gain.setValueAtTime(this.lastValue, this.ctx.currentTime);
      this.lastValue = null;
    } else {
      this.lastValue = this.node.gain.value;
      this.node.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  connect(node) {
    this.node.connect(node);
  }

}

class Pan {

  constructor(ctx) {
    this.ctx = ctx;
    this.node = ctx.createStereoPanner();
  }

  set(val) {
    this.node.pan.setValueAtTime(val, this.ctx.currentTime);
  }

  value() {
    return this.node.pan.value;
  }

  connect(node) {
    this.node.connect(node);
  }

}
