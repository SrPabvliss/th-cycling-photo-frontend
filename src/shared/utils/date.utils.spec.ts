import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatDate, isOnOrAfterToday, parseDateOnly } from './date.utils'

describe('parseDateOnly', () => {
  it('keeps the calendar day of a date-only string', () => {
    expect(formatDate(parseDateOnly('2027-02-28'))).toBe('28 feb 2027')
  })
})

describe('isOnOrAfterToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('treats the whole last day as still valid, also in the evening', () => {
    vi.setSystemTime(new Date(2027, 1, 28, 21, 30))
    expect(isOnOrAfterToday(parseDateOnly('2027-02-28'))).toBe(true)
  })

  it('expires the day after', () => {
    vi.setSystemTime(new Date(2027, 2, 1, 0, 5))
    expect(isOnOrAfterToday(parseDateOnly('2027-02-28'))).toBe(false)
  })
})
