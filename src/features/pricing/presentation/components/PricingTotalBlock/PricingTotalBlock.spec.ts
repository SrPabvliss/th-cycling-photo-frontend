import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { IPricingTier } from '../../../types/responses/pricing-preview.response'

vi.mock('../../../composables/queries/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: {
      value: {
        currency: 'USD',
        source: 'default',
        tiers: [
          { minQty: 1, maxQty: 2, pricePerPhoto: 5 },
          { minQty: 3, maxQty: 5, pricePerPhoto: 4 },
          { minQty: 6, maxQty: null, pricePerPhoto: 3 },
        ],
      },
    },
  }),
}))

import PricingTotalBlock from './PricingTotalBlock.vue'

const tier: IPricingTier = { minQty: 3, maxQty: 5, pricePerPhoto: 4 }
const nextTier: IPricingTier = { minQty: 6, maxQty: null, pricePerPhoto: 3 }

function baseProps() {
  return {
    quantity: 5,
    subtotal: 20,
    unitPrice: 4,
    currency: 'USD',
    tier,
    nextTier,
    photosToNextTier: 1,
    isLoading: false,
  }
}

describe('PricingTotalBlock', () => {
  it('shows current price per photo and total', () => {
    const w = mount(PricingTotalBlock, { props: baseProps() })
    expect(w.get('.pricing-total__unit').text()).toContain('$4.00')
    expect(w.get('.pricing-total__amount').text()).toContain('$20.00')
  })

  it('strikes through the base price when discounted', () => {
    const w = mount(PricingTotalBlock, { props: baseProps() })
    expect(w.get('.pricing-total__base').text()).toContain('$5.00')
  })

  it('hides the base price when no discount (at base tier)', () => {
    const w = mount(PricingTotalBlock, {
      props: { ...baseProps(), unitPrice: 5, tier: { minQty: 1, maxQty: 2, pricePerPhoto: 5 } },
    })
    expect(w.find('.pricing-total__base').exists()).toBe(false)
  })

  it('renders the tier progress nudge', () => {
    const w = mount(PricingTotalBlock, { props: baseProps() })
    expect(w.text()).toContain('Agrega 1 foto más y todas bajan a $3.00 c/u')
  })

  it('shows the best-price message at the top tier (no next tier)', () => {
    const w = mount(PricingTotalBlock, {
      props: {
        ...baseProps(),
        unitPrice: 3,
        tier: { minQty: 6, maxQty: null, pricePerPhoto: 3 },
        nextTier: null,
        photosToNextTier: null,
      },
    })
    expect(w.get('.pricing-total__best').text()).toContain('Mejor precio')
    expect(w.get('.pricing-total__best-price').text()).toContain('$3.00 c/u')
    expect(w.find('.tier-progress').exists()).toBe(false)
  })
})
