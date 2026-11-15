import { describe, expect, it } from 'vitest'

import {
  choiceLabel,
  eventsCountText,
  matchesSearch,
  monthsLabel,
  pickMonth,
  pickYear,
  provinceSearchMiss,
} from './event-filters'

const provinces = [
  { id: 1, name: 'Cañar', count: 2, hasEvents: true },
  { id: 2, name: 'Cotopaxi', count: 5, hasEvents: true },
  { id: 3, name: 'Esmeraldas', count: 0, hasEvents: false },
  { id: 4, name: 'Los Ríos', count: 0, hasEvents: false },
  { id: 5, name: 'Santa Elena', count: 0, hasEvents: false },
]

describe('choiceLabel', () => {
  it('says the first choice and how many more', () => {
    expect(choiceLabel([], provinces, 'Provincia')).toEqual({ text: 'Provincia', more: null })
    expect(choiceLabel([2], provinces, 'Provincia')).toEqual({ text: 'Cotopaxi', more: null })
    expect(choiceLabel([2, 1, 5], provinces, 'Provincia')).toEqual({
      text: 'Cotopaxi +2',
      more: null,
    })
  })

  it('keeps the name of the button, with how many are chosen, until the names arrive', () => {
    expect(choiceLabel([2, 1], [], 'Provincia')).toEqual({ text: 'Provincia', more: 2 })
  })
})

describe('monthsLabel', () => {
  it.each([
    [null, 'Fecha'],
    [{ from: '2026-08', to: '2026-08' }, 'Ago 2026'],
    [{ from: '2026-06', to: '2026-08' }, 'Jun – Ago 2026'],
    [{ from: '2025-12', to: '2026-02' }, 'Dic 2025 – Feb 2026'],
    [{ from: '2026-01', to: '2026-12' }, '2026'],
  ])('%j reads "%s"', (range, expected) => {
    expect(monthsLabel(range)).toBe(expected)
  })
})

describe('pickMonth', () => {
  it('a first tap chooses the month', () => {
    expect(pickMonth(null, '2026-08')).toEqual({ from: '2026-08', to: '2026-08' })
  })

  it('a second tap on another month makes the range, whichever comes first', () => {
    const august = { from: '2026-08', to: '2026-08' }
    expect(pickMonth(august, '2026-10')).toEqual({ from: '2026-08', to: '2026-10' })
    expect(pickMonth(august, '2026-06')).toEqual({ from: '2026-06', to: '2026-08' })
  })

  it('tapping the only month chosen takes it away', () => {
    expect(pickMonth({ from: '2026-08', to: '2026-08' }, '2026-08')).toBeNull()
  })

  it('a tap over a range starts again from that month', () => {
    expect(pickMonth({ from: '2026-06', to: '2026-08' }, '2026-07')).toEqual({
      from: '2026-07',
      to: '2026-07',
    })
  })
})

describe('pickYear', () => {
  it('takes the whole year, or lets it go when it was the choice', () => {
    expect(pickYear({ from: '2026-08', to: '2026-08' }, 2026)).toEqual({
      from: '2026-01',
      to: '2026-12',
    })
    expect(pickYear({ from: '2026-01', to: '2026-12' }, 2026)).toBeNull()
  })
})

describe('matchesSearch', () => {
  it('finds without accents nor capitals', () => {
    expect(matchesSearch('Cañar', 'canar')).toBe(true)
    expect(matchesSearch('Los Ríos', ' RIOS ')).toBe(true)
    expect(matchesSearch('Cotopaxi', '')).toBe(true)
    expect(matchesSearch('Cotopaxi', 'azuay')).toBe(false)
  })
})

describe('provinceSearchMiss', () => {
  it('names the one province that matches and has no races yet', () => {
    expect(provinceSearchMiss(provinces, 'esmer')).toBe('Todavía no hay carreras en Esmeraldas.')
  })

  it('speaks of those provinces when several match', () => {
    expect(provinceSearchMiss(provinces, 'e')).toBe('Todavía no hay carreras en esas provincias.')
  })

  it('says it does not know a province that is not there', () => {
    expect(provinceSearchMiss(provinces, 'narnia')).toBe('No encontramos esa provincia.')
  })
})

describe('eventsCountText', () => {
  it('counts one event or many', () => {
    expect(eventsCountText(1)).toBe('1 evento')
    expect(eventsCountText(42)).toBe('42 eventos')
    expect(eventsCountText(1520)).toBe('1.520 eventos')
  })
})
