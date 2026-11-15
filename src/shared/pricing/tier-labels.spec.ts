import { describe, expect, it } from 'vitest'

import { tierLongLabel, tierShortLabel } from './tier-cards'

describe('tier labels', () => {
  it('writes a range short and long', () => {
    expect(tierShortLabel({ minQty: 1, maxQty: 2, pricePerPhoto: 4 })).toBe('1–2')
    expect(tierLongLabel({ minQty: 1, maxQty: 2, pricePerPhoto: 4 })).toBe('1 a 2')
  })

  it('writes an open tier short and long', () => {
    expect(tierShortLabel({ minQty: 10, maxQty: null, pricePerPhoto: 2 })).toBe('10+')
    expect(tierLongLabel({ minQty: 10, maxQty: null, pricePerPhoto: 2 })).toBe('10 o más')
  })

  it('writes a tier of exactly one quantity as that number', () => {
    expect(tierShortLabel({ minQty: 3, maxQty: 3, pricePerPhoto: 3 })).toBe('3')
    expect(tierLongLabel({ minQty: 3, maxQty: 3, pricePerPhoto: 3 })).toBe('3')
  })
})
