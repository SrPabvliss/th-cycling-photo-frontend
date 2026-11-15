import type { IPublicEventFilterOption } from '@/shared/public-events'
import type { IMonthRange } from '../composables/use-event-list-filters'

export const MONTH_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
] as const

const RANGE_DASH = ' – '

/** `YYYY-MM` of a year and a month from 1 to 12. */
export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function monthLabel(key: string): string {
  return `${MONTH_SHORT[Number(key.slice(5)) - 1]} ${key.slice(0, 4)}`
}

/**
 * What a menu button says: the first choice and how many more ("Cotopaxi +2"). Before the names
 * arrive (a shared link) it keeps its own name and says how many are chosen.
 */
export function choiceLabel(
  ids: number[],
  options: IPublicEventFilterOption[],
  name: string,
): { text: string; more: number | null } {
  if (ids.length === 0) return { text: name, more: null }
  const firstName = options.find((option) => option.id === ids[0])?.name
  if (!firstName) return { text: name, more: ids.length }
  return { text: ids.length > 1 ? `${firstName} +${ids.length - 1}` : firstName, more: null }
}

/** "Ago 2026", "Jun – Ago 2026", "Dic 2025 – Feb 2026", or the year when it is all of it. */
export function monthsLabel(range: IMonthRange | null): string {
  if (!range) return 'Fecha'
  if (range.from === range.to) return monthLabel(range.from)
  const fromYear = range.from.slice(0, 4)
  const toYear = range.to.slice(0, 4)
  if (fromYear !== toYear) return monthLabel(range.from) + RANGE_DASH + monthLabel(range.to)
  if (range.from.endsWith('-01') && range.to.endsWith('-12')) return fromYear
  return MONTH_SHORT[Number(range.from.slice(5)) - 1] + RANGE_DASH + monthLabel(range.to)
}

/**
 * A tap on a month: the first one chooses it, a second tap on another makes the range, a tap on
 * the only month chosen takes it away, and a tap over a range starts again from there.
 */
export function pickMonth(range: IMonthRange | null, month: string): IMonthRange | null {
  if (range && range.from === range.to) {
    if (month === range.from) return null
    return month < range.from ? { from: month, to: range.to } : { from: range.from, to: month }
  }
  return { from: month, to: month }
}

/** "Todo 2026": the whole year, or nothing when it already was the choice. */
export function pickYear(range: IMonthRange | null, year: number): IMonthRange | null {
  const whole = { from: monthKey(year, 1), to: monthKey(year, 12) }
  return range?.from === whole.from && range.to === whole.to ? null : whole
}

function plain(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('es').trim()
}

/** Search inside a menu: no accents, no capitals ("canar" finds "Cañar"). */
export function matchesSearch(name: string, search: string): boolean {
  return plain(name).includes(plain(search))
}

/**
 * Why a province search found nothing to choose: the provinces offered are only those with races,
 * so a real one without them is named, and a name that is not a province is said so.
 */
export function provinceSearchMiss(
  provinces: { name: string; hasEvents: boolean }[],
  search: string,
): string {
  const matches = provinces.filter((province) => matchesSearch(province.name, search))
  if (matches.length === 1) return `Todavía no hay carreras en ${matches[0]!.name}.`
  if (matches.length > 1) return 'Todavía no hay carreras en esas provincias.'
  return 'No encontramos esa provincia.'
}

/** "1 evento", "1.520 eventos". */
export function eventsCountText(count: number): string {
  return `${count.toLocaleString('es-EC')} ${count === 1 ? 'evento' : 'eventos'}`
}
