import { defineComponent, h } from 'vue'

// Stand-ins for the house ads in the specs of the screens that place them: they say what was
// placed and where, without downloading anything.
export const AdSlotStub = defineComponent({
  name: 'AdSlot',
  props: { format: { type: String, required: true }, seed: { type: Number, required: true } },
  emits: ['unavailable'],
  setup(props) {
    return () =>
      h('div', { 'data-test': 'ad', 'data-format': props.format, 'data-seed': String(props.seed) })
  },
})

export const SponsorStripStub = defineComponent({
  name: 'SponsorStrip',
  setup() {
    return () => h('div', { 'data-test': 'sponsor-strip' })
  },
})
