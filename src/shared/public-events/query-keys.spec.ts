import { describe, expect, it } from 'vitest'

import { normalizePublicEventFilters, PUBLIC_EVENTS_QUERY_KEYS } from './query-keys'

describe('normalizePublicEventFilters', () => {
  it('drops a search shorter than two characters once trimmed', () => {
    expect(normalizePublicEventFilters({ search: ' a ' })).toEqual({})
    expect(normalizePublicEventFilters({ search: '   ' })).toEqual({})
  })

  it('trims the search', () => {
    expect(normalizePublicEventFilters({ search: '  ab ' })).toEqual({ search: 'ab' })
  })

  it('cuts the search at a hundred characters', () => {
    expect(normalizePublicEventFilters({ search: 'x'.repeat(150) }).search).toHaveLength(100)
  })

  it('drops hasPhotos when it filters nothing', () => {
    expect(normalizePublicEventFilters({ hasPhotos: false })).toEqual({})
    expect(normalizePublicEventFilters({ hasPhotos: true })).toEqual({ hasPhotos: true })
  })

  it('drops an event type that is not a positive integer', () => {
    expect(normalizePublicEventFilters({ eventTypeId: 0 })).toEqual({})
    expect(normalizePublicEventFilters({ eventTypeId: -2 })).toEqual({})
    expect(normalizePublicEventFilters({ eventTypeId: 1.5 })).toEqual({})
    expect(normalizePublicEventFilters({ eventTypeId: Number.NaN })).toEqual({})
    expect(normalizePublicEventFilters({ eventTypeId: 3 })).toEqual({ eventTypeId: 3 })
  })
})

describe('PUBLIC_EVENTS_QUERY_KEYS', () => {
  it('gives every way of saying "no filters" the same cache entry', () => {
    const none = PUBLIC_EVENTS_QUERY_KEYS.list({})

    expect(PUBLIC_EVENTS_QUERY_KEYS.list()).toEqual(none)
    expect(PUBLIC_EVENTS_QUERY_KEYS.list({ search: ' ' })).toEqual(none)
    expect(PUBLIC_EVENTS_QUERY_KEYS.list({ hasPhotos: false })).toEqual(none)
  })

  it('separates lists by their filters and by page size', () => {
    const none = PUBLIC_EVENTS_QUERY_KEYS.list({})

    expect(PUBLIC_EVENTS_QUERY_KEYS.list({ search: 'mama' })).not.toEqual(none)
    expect(PUBLIC_EVENTS_QUERY_KEYS.list({}, 50)).not.toEqual(none)
  })

  it('keeps the filter options under the same root as the lists', () => {
    expect(PUBLIC_EVENTS_QUERY_KEYS.filters()[0]).toBe(PUBLIC_EVENTS_QUERY_KEYS.list()[0])
  })
})
