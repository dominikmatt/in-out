Vue.component('audiotrack', {
  props: ['track'],
  template: `
    <li>
      {{ track.name }}
      <webaudio-slider src="/bower_components/webaudio-controls/img/vsliderbody.png"
        knobsrc="/bower_components/webaudio-controls/img/vsliderknob.png"
        :value="track.getVolume()" min="0" max="1" step="0.01" basewidth="24" baseheight="128"
        knobwidth="24" knobheight="24" ditchLength="100" tooltip="Slider-L"
        v-on:change="setVolume">
      </webaudio-slider>
    </li>
  `,
  methods: {
    setVolume: function(event) {
      this.track.setVolume(event.target.value);
    }
  }
})
