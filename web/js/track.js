Vue.component('audiotrack', {
  props: ['track'],
  template: `
    <li>
      <span>{{ track.name }}</span>
      <webaudio-knob src="/bower_components/webaudio-controls/img/LittlePhatty.png"
        :value="track.getPan()" min="-1" max="1" step="0.01" width="64" height="64" sprites="100"
        tooltip="Pan"
        v-on:change="setPan">
	    </webaudio-knob>
      <webaudio-slider src="/bower_components/webaudio-controls/img/vsliderbody.png"
        knobsrc="/bower_components/webaudio-controls/img/vsliderknob.png"
        :value="track.getVolume()" min="0" max="1" step="0.01" basewidth="24" baseheight="128"
        knobwidth="24" knobheight="24" ditchLength="100" tooltip="Volume"
        v-on:change="setVolume">
      </webaudio-slider>
    </li>
  `,
  methods: {
    setVolume: function(event) {
      this.track.setVolume(event.target.value);
    },
    setPan: function(event) {
      this.track.setPan(event.target.value);
    }
  }
})
