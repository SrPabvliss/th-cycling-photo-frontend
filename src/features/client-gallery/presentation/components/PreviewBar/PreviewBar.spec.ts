import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, ref } from 'vue'

import PreviewBar from './PreviewBar.vue'

const hasTiers = ref(true)
vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() =>
      hasTiers.value
        ? {
            currency: 'USD',
            source: 'default',
            tiers: [
              { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
              { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
              { minQty: 7, maxQty: null, pricePerPhoto: 2.5 },
            ],
          }
        : undefined,
    ),
  }),
}))

describe('PreviewBar', () => {
  beforeEach(() => (hasTiers.value = true))

  it('counts the chosen photos with their total and continues', async () => {
    const wrapper = mount(PreviewBar, { props: { count: 3 } })

    expect(wrapper.text()).toContain('3 fotos elegidas · $9,00')
    expect(wrapper.text()).toContain('Con 4 fotos más, todas bajan a $2,50 c/u')
    await wrapper
      .findAll('button')
      .find((each) => each.text() === 'Continuar')!
      .trigger('click')
    expect(wrapper.emitted('continue')).toHaveLength(1)
  })

  it('says one photo in singular', () => {
    expect(mount(PreviewBar, { props: { count: 1 } }).text()).toContain('1 foto elegida · $4,00')
  })

  it('explains the price before anything is chosen', () => {
    const wrapper = mount(PreviewBar, { props: { count: 0 } })

    expect(wrapper.text()).toContain('Precio por foto. Cuando llevas más, baja para todas.')
    expect(wrapper.findAll('button').some((each) => each.text() === 'Continuar')).toBe(false)
  })

  it('counts without prices when there are no tiers', () => {
    hasTiers.value = false
    const wrapper = mount(PreviewBar, { props: { count: 2 } })

    expect(wrapper.text()).toContain('2 fotos elegidas')
    expect(wrapper.text()).not.toContain('$')
  })
})
