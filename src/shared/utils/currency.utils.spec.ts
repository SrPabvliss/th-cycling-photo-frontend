import { describe, expect, it } from 'vitest'
import { formatCurrency } from './currency.utils'

describe('formatCurrency', () => {
  it('formats USD with two decimals', () => {
    expect(formatCurrency(17.5, 'USD')).toBe('$17.50')
    expect(formatCurrency(4, 'USD')).toBe('$4.00')
  })

  it('falls back to USD when currency missing', () => {
    expect(formatCurrency(20, null)).toBe('$20.00')
    expect(formatCurrency(20, undefined)).toBe('$20.00')
  })

  it('uses ISO code prefix for non-USD currencies', () => {
    expect(formatCurrency(10, 'EUR')).toBe('EUR 10.00')
  })
})
