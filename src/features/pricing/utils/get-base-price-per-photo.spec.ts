import { describe, expect, it } from 'vitest'
import { getBasePricePerPhoto } from './get-base-price-per-photo'
import type { IPricingTier } from '../types/responses/pricing-preview.response'

const tiers: IPricingTier[] = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 5 },
  { minQty: 3, maxQty: 5, pricePerPhoto: 4 },
  { minQty: 6, maxQty: null, pricePerPhoto: 3 },
]

describe('getBasePricePerPhoto', () => {
  it('returns the price of the tier with the smallest minQty', () => {
    expect(getBasePricePerPhoto(tiers)).toBe(5)
  })

  it('is order-independent', () => {
    expect(getBasePricePerPhoto([...tiers].reverse())).toBe(5)
  })

  it('returns null for empty tiers', () => {
    expect(getBasePricePerPhoto([])).toBeNull()
  })
})
