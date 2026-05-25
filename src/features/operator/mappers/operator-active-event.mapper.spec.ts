import { describe, expect, it } from 'vitest'

import { toOperatorActiveEvent } from './operator-active-event.mapper'
import type { IApiOperatorActiveEvent } from '../types/responses/operator-active-event.response'

describe('toOperatorActiveEvent', () => {
  it('parses event date and copies stats', () => {
    const api: IApiOperatorActiveEvent = {
      event: {
        id: 'e-1',
        slug: 'evento-uno',
        name: 'Evento Uno',
        startDate: '2026-04-01',
        endDate: '2026-04-02',
        location: 'Quito',
        coverUrl: 'https://cdn.test/x.jpg',
        totalPhotos: 100,
      },
      stats: {
        review: { pendingPhotos: 30, totalProcessedPhotos: 80 },
        retouch: { pendingPhotos: 4 },
      },
    }

    const result = toOperatorActiveEvent(api)

    expect(result.event.startDate).toBeInstanceOf(Date)
    expect(result.event.startDate.getUTCFullYear()).toBe(2026)
    expect(result.event.endDate).toBeInstanceOf(Date)
    expect(result.event).toMatchObject({
      id: 'e-1',
      slug: 'evento-uno',
      totalPhotos: 100,
    })
    expect(result.stats).toEqual({
      review: { pendingPhotos: 30, totalProcessedPhotos: 80 },
      retouch: { pendingPhotos: 4 },
    })
  })
})
