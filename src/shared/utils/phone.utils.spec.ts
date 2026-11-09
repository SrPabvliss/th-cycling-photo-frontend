import { describe, expect, it } from 'vitest'

import { buildWhatsAppNumber, isPhoneValid } from './phone.utils'

describe('isPhoneValid', () => {
  it('accepts a complete Ecuadorian mobile in E.164', () => {
    expect(isPhoneValid('+593984198999')).toBe(true)
  })

  it('rejects an Ecuadorian mobile that is one digit short', () => {
    expect(isPhoneValid('+59398419899')).toBe(false)
  })

  it('rejects a national-format number with no country code', () => {
    expect(isPhoneValid('098419899')).toBe(false)
  })

  it('rejects an empty value', () => {
    expect(isPhoneValid('')).toBe(false)
  })
})

describe('buildWhatsAppNumber', () => {
  it('keeps a valid number in E.164', () => {
    expect(buildWhatsAppNumber('+593984198999')).toBe('+593984198999')
  })

  it('falls back to the raw value when the number cannot be parsed', () => {
    expect(buildWhatsAppNumber('098419899')).toBe('098419899')
  })
})
