import { describe, expect, it } from 'vitest'

import { eventDateLabel, eventDateParts } from './event-date'

describe('eventDateParts', () => {
  it('gives the day and the month of a one day event', () => {
    expect(eventDateParts('2026-09-20', '2026-09-20')).toEqual({ day: '20', month: 'sep' })
  })

  it('gives the range of days of an event within one month', () => {
    expect(eventDateParts('2026-10-04', '2026-10-05')).toEqual({ day: '4–5', month: 'oct' })
  })

  it('gives both months when the event crosses into the next one', () => {
    expect(eventDateParts('2026-11-30', '2026-12-01')).toEqual({ day: '30–1', month: 'nov–dic' })
  })

  it('reads the date as a calendar date, whatever the time zone', () => {
    expect(eventDateParts('2026-10-04', '2026-10-04').day).toBe('4')
    expect(eventDateParts('2026-01-01', '2026-01-01')).toEqual({ day: '1', month: 'ene' })
  })

  it('ignores the time of a full timestamp', () => {
    expect(eventDateParts('2026-10-04T00:00:00.000Z', '2026-10-04T00:00:00.000Z')).toEqual({
      day: '4',
      month: 'oct',
    })
  })

  it('treats an end before the start as a one day event', () => {
    expect(eventDateParts('2026-10-04', '2026-10-01')).toEqual({ day: '4', month: 'oct' })
  })

  it('gives empty parts, not NaN, for a date it cannot read', () => {
    expect(eventDateParts('', 'no es fecha')).toEqual({ day: '', month: '' })
  })
})

describe('eventDateLabel', () => {
  it('reads the date out in words', () => {
    expect(eventDateLabel('2026-09-20', '2026-09-20')).toBe('20 de septiembre de 2026')
    expect(eventDateLabel('2026-10-04', '2026-10-05')).toBe('4 al 5 de octubre de 2026')
    expect(eventDateLabel('2026-11-30', '2026-12-01')).toBe(
      '30 de noviembre al 1 de diciembre de 2026',
    )
  })

  it('is empty for a date it cannot read', () => {
    expect(eventDateLabel('', '')).toBe('')
  })
})
