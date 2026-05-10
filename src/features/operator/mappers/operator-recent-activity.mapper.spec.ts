import { describe, expect, it } from 'vitest'

import { toRecentActivity } from './operator-recent-activity.mapper'
import type { IApiRecentActivity } from '../types/responses/operator-recent-activity.response'

describe('toRecentActivity', () => {
  it('parses timestamp and copies fields', () => {
    const api: IApiRecentActivity = {
      id: 'review-e1-1',
      type: 'review',
      eventId: 'e-1',
      eventName: 'Evento Uno',
      count: 5,
      description: 'Revisaste 5 fotos',
      timestamp: '2026-04-15T12:00:00.000Z',
    }
    const result = toRecentActivity(api)
    expect(result.timestamp).toBeInstanceOf(Date)
    expect(result.timestamp.toISOString()).toBe('2026-04-15T12:00:00.000Z')
    expect(result).toMatchObject({
      id: 'review-e1-1',
      type: 'review',
      count: 5,
      description: 'Revisaste 5 fotos',
    })
  })
})
