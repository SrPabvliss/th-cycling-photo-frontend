import { describe, expect, it } from 'vitest'

import { maskPhone } from './mask-phone'

describe('maskPhone', () => {
  it('keeps only the last four digits', () => {
    const masked = maskPhone('+593991234567')

    expect(masked.endsWith('4567')).toBe(true)
    expect(masked).not.toContain('99123')
    expect(masked).not.toContain('593')
  })

  it('ignores spaces and dashes in the number', () => {
    expect(maskPhone('099-123 4567')).toBe('•••• 4567')
  })

  it('does not throw on short or empty input', () => {
    expect(maskPhone('')).toBe('')
    expect(maskPhone('12')).toBe('•••• 12')
  })
})
