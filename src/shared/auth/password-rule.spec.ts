import { describe, expect, it } from 'vitest'

import { isAccountPassword, passwordChecks } from './password-rule'

describe('password rule', () => {
  it.each([
    ['abcdefg1', true],
    ['abcdefgh', false],
    ['12345678', false],
    ['ñ1234567', true],
    ['é1234567', true],
    ['🚴1234567a', true],
    ['abcde12', false],
    ['a1'.padEnd(128, 'x'), true],
    ['a1'.padEnd(129, 'x'), false],
    ['        ', false],
    ['a1      ', true],
    ['', false],
  ])('%j is an account password: %s', (value, expected) => {
    expect(isAccountPassword(value)).toBe(expected)
  })

  it('says which requirement each value meets', () => {
    expect(passwordChecks('')).toEqual({ length: false, letter: false, digit: false })
    expect(passwordChecks('abc')).toEqual({ length: false, letter: true, digit: false })
    expect(passwordChecks('12345678')).toEqual({ length: true, letter: false, digit: true })
    expect(passwordChecks('ñandú2026')).toEqual({ length: true, letter: true, digit: true })
  })

  it('counts length like the api does, in UTF-16 units, without trimming', () => {
    expect(passwordChecks('🚴🚴🚴🚴').length).toBe(true)
    expect(passwordChecks('  a1    ').length).toBe(true)
  })
})
