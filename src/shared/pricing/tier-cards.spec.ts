import { describe, expect, it } from 'vitest'

import { bestOpenTier, buildTierCards, formatMoney } from './tier-cards'

const REAL_TIERS = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]

describe('formatMoney', () => {
  it('writes dollars the way Ecuador does', () => {
    expect(formatMoney(4, 'USD')).toBe('$4,00')
    expect(formatMoney(2.5, 'USD')).toBe('$2,50')
    expect(formatMoney(1240.5, 'USD')).toBe('$1.240,50')
  })

  it('still writes the amount when the currency code is not a real one', () => {
    expect(formatMoney(4, 'dólares')).toBe('dólares 4,00')
  })
})

describe('buildTierCards', () => {
  it('builds one card per tier with the real prices', () => {
    const cards = buildTierCards(REAL_TIERS, 'USD')

    expect(cards.map((card) => card.label)).toEqual([
      '1 a 2 fotos',
      '3 a 6 fotos',
      '7 a 9 fotos',
      '10 o más fotos',
    ])
    expect(cards.map((card) => card.price)).toEqual(['$4,00', '$3,00', '$2,50', '$2,00'])
    expect(cards.map((card) => card.discountPercent)).toEqual([null, 25, 38, 50])
    expect(cards.map((card) => card.basePrice)).toEqual([null, '$4,00', '$4,00', '$4,00'])
    expect(cards.map((card) => card.isBest)).toEqual([false, false, false, true])
  })

  it('sorts tiers that come out of order', () => {
    const cards = buildTierCards(
      [REAL_TIERS[3]!, REAL_TIERS[0]!, REAL_TIERS[2]!, REAL_TIERS[1]!],
      'USD',
    )

    expect(cards.map((card) => card.label)).toEqual([
      '1 a 2 fotos',
      '3 a 6 fotos',
      '7 a 9 fotos',
      '10 o más fotos',
    ])
    expect(cards.map((card) => card.discountPercent)).toEqual([null, 25, 38, 50])
  })

  it('does not change the list it was given', () => {
    const tiers = [REAL_TIERS[3]!, REAL_TIERS[0]!]

    buildTierCards(tiers, 'USD')

    expect(tiers[0]).toBe(REAL_TIERS[3])
  })

  it('builds a single card with no discount for a single tier', () => {
    expect(buildTierCards([{ minQty: 1, maxQty: null, pricePerPhoto: 4 }], 'USD')).toEqual([
      {
        label: '1 o más fotos',
        price: '$4,00',
        discountPercent: null,
        basePrice: null,
        isBest: true,
      },
    ])
  })

  it('labels a tier of exactly one quantity', () => {
    const cards = buildTierCards(
      [
        { minQty: 1, maxQty: 1, pricePerPhoto: 4 },
        { minQty: 3, maxQty: 3, pricePerPhoto: 3 },
      ],
      'USD',
    )

    expect(cards.map((card) => card.label)).toEqual(['1 foto', '3 fotos'])
  })

  it('has no discounts, and divides by nothing, when the base price is zero', () => {
    const cards = buildTierCards(
      [
        { minQty: 1, maxQty: 2, pricePerPhoto: 0 },
        { minQty: 3, maxQty: null, pricePerPhoto: 0 },
      ],
      'USD',
    )

    expect(cards.map((card) => card.discountPercent)).toEqual([null, null])
    expect(cards.map((card) => card.basePrice)).toEqual([null, null])
  })

  it('shows no discount for a tier that costs more than the base one', () => {
    const cards = buildTierCards(
      [
        { minQty: 1, maxQty: 2, pricePerPhoto: 3 },
        { minQty: 3, maxQty: null, pricePerPhoto: 4 },
      ],
      'USD',
    )

    expect(cards.map((card) => card.discountPercent)).toEqual([null, null])
    expect(cards.map((card) => card.isBest)).toEqual([true, false])
  })

  it('gives the best mark to the last of the tiers tied at the lowest price', () => {
    const cards = buildTierCards(
      [
        { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
        { minQty: 3, maxQty: 6, pricePerPhoto: 2 },
        { minQty: 7, maxQty: null, pricePerPhoto: 2 },
      ],
      'USD',
    )

    expect(cards.map((card) => card.isBest)).toEqual([false, false, true])
  })

  it('gives back nothing for no tiers', () => {
    expect(buildTierCards([], 'USD')).toEqual([])
  })
})

describe('bestOpenTier', () => {
  it('finds the open tier when it is the cheapest', () => {
    expect(bestOpenTier(REAL_TIERS)).toEqual({ minQty: 10, maxQty: null, pricePerPhoto: 2 })
  })

  it('finds nothing when the cheapest tier is not the open one, or there is none', () => {
    expect(
      bestOpenTier([
        { minQty: 1, maxQty: 2, pricePerPhoto: 2 },
        { minQty: 3, maxQty: null, pricePerPhoto: 4 },
      ]),
    ).toBeNull()
    expect(bestOpenTier([{ minQty: 1, maxQty: 2, pricePerPhoto: 2 }])).toBeNull()
    expect(bestOpenTier([])).toBeNull()
  })
})
