import { format, formatDistanceToNow, parse } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Parses an ISO date string as a local date, ignoring the time/timezone portion.
 * Prevents timezone offset from shifting the date by ±1 day.
 *
 * Example: "2026-02-21T00:00:00.000Z" → Feb 21 at noon local time (not Feb 20 at 7pm in UTC-5)
 */
export function parseDateOnly(isoString: string): Date {
  const datePart = isoString.split('T')[0]!
  return parse(datePart, 'yyyy-MM-dd', new Date(2000, 0, 1, 12))
}

/**
 * Formats a date for display: "21 feb 2026"
 */
export function formatDate(date: Date): string {
  return format(date, 'd MMM yyyy', { locale: es })
}

/**
 * Formats a date as relative time: "hace 2 horas", "hace 3 días"
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { locale: es, addSuffix: true })
}

/**
 * Checks if a date is within the last N hours (default 24).
 */
export function isRecent(date: Date, hours = 24): boolean {
  const threshold = new Date()
  threshold.setHours(threshold.getHours() - hours)
  return date > threshold
}
