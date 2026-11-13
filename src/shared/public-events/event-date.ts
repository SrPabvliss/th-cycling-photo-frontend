const MONTHS_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]
const MONTHS_LONG = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

interface ICalendarDate {
  year: number
  /** 0 to 11. */
  month: number
  day: number
}

/**
 * Reads `yyyy-MM-dd` (a time after it is ignored) without going through Date: an event day is a
 * day on the calendar, and a Date would move it to the day before in time zones west of UTC.
 */
function parseCalendarDate(value: string): ICalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null

  const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])]
  if (month < 0 || month > 11 || day < 1 || day > 31) return null

  return { year, month, day }
}

const ordinal = (date: ICalendarDate) => date.year * 10_000 + date.month * 100 + date.day

function readRange(startDate: string, endDate: string): [ICalendarDate, ICalendarDate] | null {
  const start = parseCalendarDate(startDate)
  if (!start) return null

  const end = parseCalendarDate(endDate)
  return [start, end && ordinal(end) > ordinal(start) ? end : start]
}

export interface IEventDateParts {
  day: string
  month: string
}

/** Short date for the date block of an event card: "20" / "sep", "4–5" / "oct", "30–1" / "nov–dic". */
export function eventDateParts(startDate: string, endDate: string): IEventDateParts {
  const range = readRange(startDate, endDate)
  if (!range) return { day: '', month: '' }

  const [start, end] = range
  const isOneDay = ordinal(start) === ordinal(end)
  const isOneMonth = start.month === end.month && start.year === end.year

  return {
    day: isOneDay ? String(start.day) : `${start.day}–${end.day}`,
    month: isOneMonth
      ? MONTHS_SHORT[start.month]!
      : `${MONTHS_SHORT[start.month]}–${MONTHS_SHORT[end.month]}`,
  }
}

/** The same date in words, for a screen reader: "4 al 5 de octubre de 2026". */
export function eventDateLabel(startDate: string, endDate: string): string {
  const range = readRange(startDate, endDate)
  if (!range) return ''

  const [start, end] = range
  const endText = `${end.day} de ${MONTHS_LONG[end.month]} de ${end.year}`

  if (ordinal(start) === ordinal(end)) return endText
  if (start.month === end.month && start.year === end.year) return `${start.day} al ${endText}`
  if (start.year === end.year) return `${start.day} de ${MONTHS_LONG[start.month]} al ${endText}`
  return `${start.day} de ${MONTHS_LONG[start.month]} de ${start.year} al ${endText}`
}
