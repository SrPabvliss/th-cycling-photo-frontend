import { describe, expect, it } from 'vitest'

import { toPublicEventListItem } from './public-event.mapper'
import type { IApiPublicEventListItem } from './public-event.types'

function apiEvent(overrides: Partial<IApiPublicEventListItem> = {}): IApiPublicEventListItem {
  return {
    slug: 'mama-rumi-2026',
    name: 'Mama Rumi 2026',
    startDate: '2026-10-04',
    endDate: '2026-10-05',
    provinceName: 'Tungurahua',
    cantonName: 'Baños',
    photoCount: 1240,
    ownerName: 'Titan TV',
    coverSlug: 'cover-abc',
    eventTypeId: 3,
    eventTypeName: 'Downhill',
    ...overrides,
  }
}

describe('toPublicEventListItem', () => {
  it('joins canton and province into one place label', () => {
    expect(toPublicEventListItem(apiEvent()).placeLabel).toBe('Baños, Tungurahua')
  })

  it('leaves no dangling comma when only one of them comes', () => {
    expect(toPublicEventListItem(apiEvent({ cantonName: null })).placeLabel).toBe('Tungurahua')
    expect(toPublicEventListItem(apiEvent({ provinceName: null })).placeLabel).toBe('Baños')
  })

  it('has no place label when neither comes', () => {
    const event = toPublicEventListItem(apiEvent({ cantonName: null, provinceName: null }))

    expect(event.placeLabel).toBeNull()
  })

  it('builds the cover url from the cover slug', () => {
    expect(toPublicEventListItem(apiEvent()).coverUrl).toBe(
      'http://localhost/cdn/assets/cover-sm/cover-abc.jpg',
    )
  })

  it('has no cover url without a cover slug', () => {
    expect(toPublicEventListItem(apiEvent({ coverSlug: null })).coverUrl).toBeNull()
  })

  it('keeps the dates as calendar dates and carries the rest over', () => {
    expect(toPublicEventListItem(apiEvent())).toMatchObject({
      slug: 'mama-rumi-2026',
      name: 'Mama Rumi 2026',
      startDate: '2026-10-04',
      endDate: '2026-10-05',
      photoCount: 1240,
      ownerName: 'Titan TV',
      eventTypeId: 3,
      eventTypeName: 'Downhill',
    })
  })

  it('drops the time when the api sends a full timestamp', () => {
    const event = toPublicEventListItem(apiEvent({ startDate: '2026-10-04T00:00:00.000Z' }))

    expect(event.startDate).toBe('2026-10-04')
  })
})
