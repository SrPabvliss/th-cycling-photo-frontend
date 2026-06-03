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
/**
 * Formats a date with time: "16 oct, 11:00"
 */
export function formatDateTime(date: Date): string {
  return format(date, 'd MMM, HH:mm', { locale: es })
}

/**
 * Returns a time-appropriate greeting: "Buenos días" / "Buenas tardes" / "Buenas noches"
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

/**
 * Checks if a date is within the last N hours (default 24).
 */
export function isRecent(date: Date, hours = 24): boolean {
  const threshold = new Date()
  threshold.setHours(threshold.getHours() - hours)
  return date > threshold
}

/**
 * Returns the number of days in a given month. Falls back to 31 when year/month are unknown.
 */
export function daysInMonth(year: number | null, month: number | null): number {
  if (year == null || month == null) return 31
  return new Date(year, month, 0).getDate()
}

/**
 * Confirms (year, month, day) corresponds to a real calendar date.
 * Rejects values like (2026, 2, 31) that JS would otherwise roll forward.
 */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day)
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
}

/**
 * Calculates current age in full years from a birth date triple.
 * Accounts for whether the birthday has already occurred this year.
 */
export function calculateAge(
  year: number,
  month: number,
  day: number,
  today: Date = new Date(),
): number {
  let age = today.getFullYear() - year
  const hasHadBirthday =
    today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() >= day)
  if (!hasHadBirthday) age--
  return age
}
