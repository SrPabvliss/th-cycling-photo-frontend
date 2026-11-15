import { describe, expect, it } from 'vitest'

import {
  normalizePublicEventFilters,
  PUBLIC_EVENTS_QUERY_KEYS,
  toPublicEventParams,
} from './query-keys'

const none = { eventTypeIds: [], provinceIds: [] }

describe('normalizePublicEventFilters', () => {
  it('drops a search shorter than two characters once trimmed', () => {
    expect(normalizePublicEventFilters({ ...none, search: ' a ' })).toEqual(none)
    expect(normalizePublicEventFilters({ ...none, search: '   ' })).toEqual(none)
  })

  it('trims the search and cuts it at a hundred characters', () => {
    expect(normalizePublicEventFilters({ ...none, search: '  ab ' })).toEqual({
      ...none,
      search: 'ab',
    })
    expect(normalizePublicEventFilters({ ...none, search: 'x'.repeat(150) }).search).toHaveLength(
      100,
    )
  })

  it('keeps each id once, in order, and only positive integers, at most twenty', () => {
    const many = Array.from({ length: 25 }, (_, index) => 25 - index)
    expect(
      normalizePublicEventFilters({
        eventTypeIds: [7, 2, 7, 0, -1, 1.5, Number.NaN],
        provinceIds: many,
      }),
    ).toEqual({ eventTypeIds: [2, 7], provinceIds: many.slice(5).sort((a, b) => a - b) })
  })

  it('takes one month as both ends of the range', () => {
    expect(normalizePublicEventFilters({ ...none, from: '2026-08' })).toEqual({
      ...none,
      from: '2026-08',
      to: '2026-08',
    })
    expect(normalizePublicEventFilters({ ...none, to: '2026-08' })).toEqual({
      ...none,
      from: '2026-08',
      to: '2026-08',
    })
  })

  it('drops a range that is not two months in order', () => {
    expect(normalizePublicEventFilters({ ...none, from: '2026-13' })).toEqual(none)
    expect(normalizePublicEventFilters({ ...none, from: '2026-8' })).toEqual(none)
    expect(normalizePublicEventFilters({ ...none, from: '2026-08', to: '2026-06' })).toEqual(none)
    expect(normalizePublicEventFilters({ ...none, from: '2026-06', to: 'agosto' })).toEqual({
      ...none,
      from: '2026-06',
      to: '2026-06',
    })
  })
})

describe('toPublicEventParams', () => {
  it('sends each list as one parameter of ids joined by commas, without spaces', () => {
    expect(
      toPublicEventParams({
        search: 'quito',
        eventTypeIds: [2, 1],
        provinceIds: [7, 3, 3],
        from: '2026-06',
        to: '2026-08',
      }),
    ).toEqual({
      search: 'quito',
      eventTypeIds: '1,2',
      provinceIds: '3,7',
      from: '2026-06',
      to: '2026-08',
    })
  })

  it('leaves out every parameter that has nothing marked', () => {
    expect(toPublicEventParams(none)).toEqual({})
    expect(toPublicEventParams({ ...none, search: ' ' })).toEqual({})
  })

  it('never sends the parameters the api no longer takes', () => {
    const params = toPublicEventParams({
      ...none,
      eventTypeIds: [4],
      hasPhotos: true,
      eventTypeId: 4,
    } as never)

    expect(params).toEqual({ eventTypeIds: '4' })
  })
})

describe('PUBLIC_EVENTS_QUERY_KEYS', () => {
  it('gives every way of saying "no filters" the same cache entry', () => {
    const empty = PUBLIC_EVENTS_QUERY_KEYS.list(none)

    expect(PUBLIC_EVENTS_QUERY_KEYS.list()).toEqual(empty)
    expect(PUBLIC_EVENTS_QUERY_KEYS.list({ ...none, search: ' ' })).toEqual(empty)
  })

  it('gives the same choice in another order the same cache entry', () => {
    expect(PUBLIC_EVENTS_QUERY_KEYS.list({ eventTypeIds: [2, 1], provinceIds: [] })).toEqual(
      PUBLIC_EVENTS_QUERY_KEYS.list({ eventTypeIds: [1, 2], provinceIds: [] }),
    )
  })

  it('separates lists by their filters and by page size', () => {
    const empty = PUBLIC_EVENTS_QUERY_KEYS.list(none)

    expect(PUBLIC_EVENTS_QUERY_KEYS.list({ ...none, search: 'mama' })).not.toEqual(empty)
    expect(PUBLIC_EVENTS_QUERY_KEYS.list(none, 50)).not.toEqual(empty)
  })

  it('separates the filter options by their filters, under the same root as the lists', () => {
    expect(PUBLIC_EVENTS_QUERY_KEYS.filters(none)[0]).toBe(PUBLIC_EVENTS_QUERY_KEYS.list()[0])
    expect(PUBLIC_EVENTS_QUERY_KEYS.filters({ ...none, provinceIds: [3] })).not.toEqual(
      PUBLIC_EVENTS_QUERY_KEYS.filters(none),
    )
  })
})
