import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatDate, formatTimeOrDateTime, isOnOrAfterToday, parseDateOnly } from './date.utils'

describe('parseDateOnly', () => {
  it('keeps the calendar day of a date-only string', () => {
    expect(formatDate(parseDateOnly('2027-02-28'))).toBe('28 feb 2027')
  })
})

describe('formatTimeOrDateTime', () => {
  const now = new Date(2026, 10, 17, 15, 0)

  it('shows only the time for something that happened today', () => {
    expect(formatTimeOrDateTime(new Date(2026, 10, 17, 9, 5), now)).toBe('09:05')
  })

  it('adds the day once it is no longer today', () => {
    expect(formatTimeOrDateTime(new Date(2026, 10, 16, 23, 40), now)).toBe('16 nov, 23:40')
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
