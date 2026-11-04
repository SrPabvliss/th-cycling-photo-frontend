import { describe, expect, it } from 'vitest'

import { isWellFormedIdNumber, normalizeIdNumber } from './billing-identification'

describe('normalizeIdNumber', () => {
  it('turns a passport into uppercase letters and digits', () => {
    expect(normalizeIdNumber('passport', 'ab-123 45')).toBe('AB12345')
  })

  it('only trims a cédula or a RUC', () => {
    expect(normalizeIdNumber('national_id', ' 1710034065 ')).toBe('1710034065')
    expect(normalizeIdNumber('ruc', '1790012345001 ')).toBe('1790012345001')
  })
})

describe('isWellFormedIdNumber', () => {
  it('wants ten digits for a cédula', () => {
    expect(isWellFormedIdNumber('national_id', '171003406')).toBe(false)
    expect(isWellFormedIdNumber('national_id', '1710034065')).toBe(true)
  })

  it('wants thirteen digits for a RUC', () => {
    expect(isWellFormedIdNumber('ruc', '1790012345001')).toBe(true)
    expect(isWellFormedIdNumber('ruc', '1710034065')).toBe(false)
  })

  it('wants up to twenty letters or digits for a passport', () => {
    expect(isWellFormedIdNumber('passport', 'AB12345')).toBe(true)
    expect(isWellFormedIdNumber('passport', 'A'.repeat(21))).toBe(false)
    expect(isWellFormedIdNumber('passport', '')).toBe(false)
  })
})
