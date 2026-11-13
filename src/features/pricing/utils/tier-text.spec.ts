import { describe, expect, it } from 'vitest'

import { quotePhotos } from './quote'
import { nextTierText } from './tier-text'

const REAL_TIERS = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]

const textFor = (quantity: number) => nextTierText(quotePhotos(REAL_TIERS, quantity)!, 'USD')

describe('nextTierText', () => {
  it('says one photo in the singular', () => {
    expect(textFor(2)).toBe('Con 1 foto más, todas bajan a $3,00 c/u')
    expect(textFor(9)).toBe('Con 1 foto más, todas bajan a $2,00 c/u')
  })

  it('says several photos in the plural', () => {
    expect(textFor(1)).toBe('Con 2 fotos más, todas bajan a $3,00 c/u')
    expect(textFor(3)).toBe('Con 4 fotos más, todas bajan a $2,50 c/u')
  })

  it('says so at the best price', () => {
    expect(textFor(10)).toBe('Ya tienes el mejor precio')
  })
})
