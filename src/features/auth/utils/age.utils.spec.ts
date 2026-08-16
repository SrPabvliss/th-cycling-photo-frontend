import { describe, expect, it } from 'vitest'
import { calculateAge, isMinor } from './age.utils'

const TODAY = new Date(2026, 7, 16)

describe('calculateAge', () => {
  it('counts full years already completed', () => {
    expect(calculateAge(2000, 1, 1, TODAY)).toBe(26)
  })

  it('does not count the current year before the birthday', () => {
    expect(calculateAge(2000, 12, 31, TODAY)).toBe(25)
  })

  it('counts the year on the exact birthday', () => {
    expect(calculateAge(2008, 8, 16, TODAY)).toBe(18)
  })

  it('does not count the year one day before the birthday', () => {
    expect(calculateAge(2008, 8, 17, TODAY)).toBe(17)
  })
})

describe('isMinor', () => {
  it('flags a rider in a youth category', () => {
    expect(isMinor(2012, 5, 10, TODAY)).toBe(true)
  })

  it('does not flag an adult', () => {
    expect(isMinor(1995, 4, 23, TODAY)).toBe(false)
  })

  it('does not flag someone turning 18 today', () => {
    expect(isMinor(2008, 8, 16, TODAY)).toBe(false)
  })

  it('flags someone turning 18 tomorrow', () => {
    expect(isMinor(2008, 8, 17, TODAY)).toBe(true)
  })

  it('returns false when the birth date is incomplete', () => {
    expect(isMinor(null, 8, 17, TODAY)).toBe(false)
    expect(isMinor(2008, null, 17, TODAY)).toBe(false)
    expect(isMinor(2008, 8, null, TODAY)).toBe(false)
  })
})
