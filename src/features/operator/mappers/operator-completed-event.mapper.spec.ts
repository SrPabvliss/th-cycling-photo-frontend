import { describe, expect, it } from 'vitest'

import { toOperatorCompletedEvent } from './operator-completed-event.mapper'
import type { IApiOperatorCompletedEvent } from '../types/responses/operator-completed-event.response'

describe('toOperatorCompletedEvent', () => {
  it('parses event summary and completedAt iso', () => {
    const api: IApiOperatorCompletedEvent = {
      event: {
        id: 'e-1',
        slug: 'evento-uno',
        name: 'Evento Uno',
        date: '2026-04-01',
        location: 'Quito',
        coverUrl: null,
        totalPhotos: 200,
      },
      stats: {
        totalRetouched: 30,
        completedAt: '2026-04-15T12:00:00.000Z',
      },
    }

    const result = toOperatorCompletedEvent(api)

    expect(result.event.date).toBeInstanceOf(Date)
    expect(result.stats.completedAt).toBeInstanceOf(Date)
    expect(result.stats.completedAt?.toISOString()).toBe('2026-04-15T12:00:00.000Z')
    expect(result.stats.totalRetouched).toBe(30)
  })

  it('handles null completedAt', () => {
    const api: IApiOperatorCompletedEvent = {
      event: {
        id: 'e-2',
        slug: 'evento-dos',
        name: 'Evento Dos',
        date: '2026-04-01',
        location: 'Quito',
        coverUrl: null,
        totalPhotos: 0,
      },
      stats: {
        totalRetouched: 0,
        completedAt: null,
      },
    }
    expect(toOperatorCompletedEvent(api).stats.completedAt).toBeNull()
  })
})
