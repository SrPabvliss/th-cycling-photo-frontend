import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PricingTierProgress from './PricingTierProgress.vue'
import type { IPricingTier } from '../../../types/responses/pricing-preview.response'

const tier: IPricingTier = { minQty: 3, maxQty: 5, pricePerPhoto: 4 }
const nextTier: IPricingTier = { minQty: 6, maxQty: null, pricePerPhoto: 3 }

describe('PricingTierProgress', () => {
  it('renders the volume nudge with the next tier price', () => {
    const w = mount(PricingTierProgress, {
      props: { tier, nextTier, photosToNextTier: 1, quantity: 5, currency: 'USD' },
    })
    expect(w.text()).toContain('Agrega 1 foto más y todas bajan a $3.00 c/u')
  })

  it('shows the volume-offer eyebrow', () => {
    const w = mount(PricingTierProgress, {
      props: { tier, nextTier, photosToNextTier: 1, quantity: 5, currency: 'USD' },
    })
    expect(w.get('.tier-progress__eyebrow').text()).toContain('Oferta por volumen')
  })

  it('shows the counter and fills toward the next tier threshold', () => {
    const w = mount(PricingTierProgress, {
      props: { tier, nextTier, photosToNextTier: 1, quantity: 5, currency: 'USD' },
    })
    expect(w.get('.tier-progress__counter').text()).toBe('5 de 6 fotos')
    // 5 / 6 = 83%
    expect(w.get('.tier-progress__fill').attributes('style')).toContain('width: 83%')
  })

  it('renders nothing when there is no next tier', () => {
    const w = mount(PricingTierProgress, {
      props: { tier, nextTier: null, photosToNextTier: null, quantity: 8, currency: 'USD' },
    })
    expect(w.find('.tier-progress').exists()).toBe(false)
  })

  it('applies the soft emphasis modifier', () => {
    const w = mount(PricingTierProgress, {
      props: {
        tier,
        nextTier,
        photosToNextTier: 1,
        quantity: 5,
        currency: 'USD',
        emphasis: 'soft',
      },
    })
    expect(w.get('.tier-progress').classes()).toContain('tier-progress--soft')
  })
})
