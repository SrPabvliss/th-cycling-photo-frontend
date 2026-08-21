import { describe, expect, it } from 'vitest'
import { getOrderAmountLabel } from './order-amount.utils'

describe('order-amount.utils', () => {
  describe('getOrderAmountLabel', () => {
    it('renders Regalo for gifted orders regardless of subtotal', () => {
      expect(getOrderAmountLabel({ state: 'gifted', subtotal: '30.00', currency: 'USD' })).toBe(
        'Regalo',
      )
      expect(getOrderAmountLabel({ state: 'gifted', subtotal: null, currency: null })).toBe(
        'Regalo',
      )
    })

    it('returns null when subtotal or currency is missing', () => {
      expect(getOrderAmountLabel({ state: 'ready', subtotal: null, currency: 'USD' })).toBeNull()
      expect(getOrderAmountLabel({ state: 'ready', subtotal: '30.00', currency: null })).toBeNull()
    })

    it('formats the amount for non-gifted states', () => {
      expect(getOrderAmountLabel({ state: 'ready', subtotal: '30', currency: 'USD' })).toBe(
        '$30.00',
      )
      expect(getOrderAmountLabel({ state: 'in_process', subtotal: '17.5', currency: 'EUR' })).toBe(
        'EUR 17.50',
      )
    })

    it('renders the price for cancelled orders', () => {
      expect(getOrderAmountLabel({ state: 'cancelled', subtotal: '10', currency: 'USD' })).toBe(
        '$10.00',
      )
    })
  })
})
