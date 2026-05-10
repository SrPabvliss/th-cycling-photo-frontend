import { describe, expect, it } from 'vitest'
import { toReviewQueueItem } from './review-queue.mapper'
import type { IApiReviewQueueItem } from '../types/responses/review-queue.response'

describe('review-queue.mapper', () => {
  const apiItem: IApiReviewQueueItem = {
    id: 'p-1',
    publicSlug: 'slug-1',
    filename: 'a.jpg',
    thumbnailUrl: 'https://cdn/x.jpg',
    status: 'processed',
    reviewedAt: '2026-05-09T10:00:00Z',
    minBibConfidence: 0.42,
    bibsCount: 2,
    colorsCount: 6,
  }

  describe('toReviewQueueItem', () => {
    it('maps reviewedAt string to Date', () => {
      const result = toReviewQueueItem(apiItem)
      expect(result.reviewedAt).toBeInstanceOf(Date)
      expect(result.reviewedAt?.toISOString()).toBe('2026-05-09T10:00:00.000Z')
    })

    it('keeps reviewedAt null when api returns null', () => {
      const result = toReviewQueueItem({ ...apiItem, reviewedAt: null })
      expect(result.reviewedAt).toBeNull()
    })

    it('preserves all other fields', () => {
      const result = toReviewQueueItem(apiItem)
      expect(result.id).toBe('p-1')
      expect(result.publicSlug).toBe('slug-1')
      expect(result.filename).toBe('a.jpg')
      expect(result.thumbnailUrl).toBe('https://cdn/x.jpg')
      expect(result.status).toBe('processed')
      expect(result.minBibConfidence).toBe(0.42)
      expect(result.bibsCount).toBe(2)
      expect(result.colorsCount).toBe(6)
    })
  })
})
