'use strict';

;(function(win, doc){

  console.log(win, doc);
  const context = new win.AudioContext();
  const dev = navigator.mediaDevices;
  const session = {
    audio: true,
    video: false
  };

  var onMedia = (stream) => {
    console.log(stream);
    var audioInput = context.createMediaStreamSource(stream);
    var bufferSize = 2048;
    // create a javascript node
    var recorder = context.createScriptProcessor(bufferSize, 1, 1);
    // specify the processing function
    recorder.onaudioprocess = (e) => {
      var inputBuffer = e.inputBuffer;
      var outputBuffer= e.outputBuffer;

      // Loop through the output channels (in this case there is only one)
      for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        let inputData = inputBuffer.getChannelData(channel);
        let outputData = outputBuffer.getChannelData(channel);

        // Loop through the 4096 samples
        for (var sample = 0; sample < inputBuffer.length; sample++) {
          // make output equal to the same as the input
          outputData[sample] = inputData[sample];
          // add noise to each output sample
          outputData[sample] += ((Math.random() * 2) - 1) * 0.1;         
        }
      }
    };

    // connect stream to our recorder
    audioInput.connect(recorder);
    // connect our recorder to the previous destination
    recorder.connect(context.destination);
  };

  dev.getUserMedia(session).then(onMedia).catch(console.error);

})(window, document);
