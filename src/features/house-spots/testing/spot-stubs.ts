import { defineComponent, h } from 'vue'

// Stand-ins for the house ads in the specs of the screens that place them: they say what was
// placed and where, without downloading anything.
export const HouseSpotStub = defineComponent({
  name: 'HouseSpot',
  props: { format: { type: String, required: true }, seed: { type: Number, required: true } },
  emits: ['unavailable'],
  setup(props) {
    return () =>
      h('div', {
        'data-test': 'house-spot',
        'data-format': props.format,
        'data-seed': String(props.seed),
      })
  },
})

export const EventPresenterStripStub = defineComponent({
  name: 'EventPresenterStrip',
  setup() {
    return () => h('div', { 'data-test': 'presenter-strip' })
  },
})
