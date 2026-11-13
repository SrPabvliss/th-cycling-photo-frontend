import { describe, expect, it } from 'vitest'

import { quotePhotos } from './quote'

const REAL_TIERS = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]

describe('quotePhotos', () => {
  it('prices two photos at the first tier and says what is missing for the next', () => {
    expect(quotePhotos(REAL_TIERS, 2)).toEqual({
      quantity: 2,
      unitPrice: 4,
      total: 8,
      tierIndex: 0,
      next: { missing: 1, unitPrice: 3 },
    })
  })

  it('lowers the price of every photo when the order reaches a tier', () => {
    expect(quotePhotos(REAL_TIERS, 3)).toMatchObject({ unitPrice: 3, total: 9, tierIndex: 1 })
    expect(quotePhotos(REAL_TIERS, 3)?.next).toEqual({ missing: 4, unitPrice: 2.5 })
    expect(quotePhotos(REAL_TIERS, 7)).toMatchObject({ unitPrice: 2.5, total: 17.5, tierIndex: 2 })
    expect(quotePhotos(REAL_TIERS, 9)?.next).toEqual({ missing: 1, unitPrice: 2 })
  })

  it('has nothing next at the best price', () => {
    expect(quotePhotos(REAL_TIERS, 10)).toEqual({
      quantity: 10,
      unitPrice: 2,
      total: 20,
      tierIndex: 3,
      next: null,
    })
    expect(quotePhotos(REAL_TIERS, 250)).toMatchObject({ total: 500, next: null })
  })

  it.each([0, -1, 1.5, Number.NaN])('gives no quote for a quantity of %s', (quantity) => {
    expect(quotePhotos(REAL_TIERS, quantity)).toBeNull()
  })

  it('gives no quote without tiers', () => {
    expect(quotePhotos([], 3)).toBeNull()
  })

  it('gives no quote for a quantity no tier covers', () => {
    const capped = [{ minQty: 1, maxQty: 5, pricePerPhoto: 4 }]

    expect(quotePhotos(capped, 6)).toBeNull()
    expect(quotePhotos([{ minQty: 3, maxQty: null, pricePerPhoto: 4 }], 2)).toBeNull()
  })

  it('reads tiers that come out of order the same way', () => {
    const shuffled = [REAL_TIERS[2]!, REAL_TIERS[0]!, REAL_TIERS[3]!, REAL_TIERS[1]!]

    expect(quotePhotos(shuffled, 2)).toEqual(quotePhotos(REAL_TIERS, 2))
    expect(quotePhotos(shuffled, 8)).toEqual(quotePhotos(REAL_TIERS, 8))
  })

  it('adds up in whole cents', () => {
    const cheap = [{ minQty: 1, maxQty: null, pricePerPhoto: 0.1 }]

    expect(quotePhotos(cheap, 3)?.total).toBe(0.3)
    expect(quotePhotos([{ minQty: 1, maxQty: null, pricePerPhoto: 1.1 }], 3)?.total).toBe(3.3)
  })

  it('has nothing next with a single tier', () => {
    expect(quotePhotos([{ minQty: 1, maxQty: null, pricePerPhoto: 4 }], 1)?.next).toBeNull()
  })

  it('skips a later tier that is not cheaper', () => {
    const tiers = [
      { minQty: 1, maxQty: 2, pricePerPhoto: 3 },
      { minQty: 3, maxQty: 5, pricePerPhoto: 3 },
      { minQty: 6, maxQty: null, pricePerPhoto: 2 },
    ]

    expect(quotePhotos(tiers, 1)?.next).toEqual({ missing: 5, unitPrice: 2 })
  })
})
