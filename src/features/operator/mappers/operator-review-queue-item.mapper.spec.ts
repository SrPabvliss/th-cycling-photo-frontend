import { describe, expect, it } from 'vitest'

import { toOperatorReviewQueueItem } from './operator-review-queue-item.mapper'
import type { IApiOperatorReviewQueueItem } from '../types/responses/operator-review-queue-item.response'

describe('toOperatorReviewQueueItem', () => {
  it('parses reviewedAt iso to Date and copies all fields', () => {
    const api: IApiOperatorReviewQueueItem = {
      id: 'p-1',
      publicSlug: 'slug-1',
      filename: 'IMG.jpg',
      thumbnailUrl: 'https://cdn.test/thumb.jpg',
      status: 'processed' as never,
      reviewedAt: null,
      minBibConfidence: 0.42,
      bibsCount: 2,
      colorsCount: 3,
      event: { id: 'e-1', slug: 'evento-uno', name: 'Evento Uno' },
    }
    const result = toOperatorReviewQueueItem(api)
    expect(result).toEqual({
      id: 'p-1',
      publicSlug: 'slug-1',
      filename: 'IMG.jpg',
      thumbnailUrl: 'https://cdn.test/thumb.jpg',
      status: 'processed',
      reviewedAt: null,
      minBibConfidence: 0.42,
      bibsCount: 2,
      colorsCount: 3,
      event: { id: 'e-1', slug: 'evento-uno', name: 'Evento Uno' },
    })
  })

  it('parses reviewedAt iso when present', () => {
    const api: IApiOperatorReviewQueueItem = {
      id: 'p-2',
      publicSlug: 'slug-2',
      filename: 'IMG2.jpg',
      thumbnailUrl: null,
      status: 'reviewed' as never,
      reviewedAt: '2026-04-15T12:00:00.000Z',
      minBibConfidence: null,
      bibsCount: 0,
      colorsCount: 0,
      event: { id: 'e-1', slug: 'evento-uno', name: 'Evento Uno' },
    }
    const result = toOperatorReviewQueueItem(api)
    expect(result.reviewedAt).toBeInstanceOf(Date)
    expect(result.reviewedAt?.toISOString()).toBe('2026-04-15T12:00:00.000Z')
  })
})
