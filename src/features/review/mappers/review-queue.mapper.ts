import type { IApiReviewQueueItem } from '../types/responses/review-queue.response'
import type { IReviewQueueItem } from '../types/review-queue-item.type'

export function toReviewQueueItem(api: IApiReviewQueueItem): IReviewQueueItem {
  return {
    id: api.id,
    publicSlug: api.publicSlug,
    filename: api.filename,
    thumbnailUrl: api.thumbnailUrl,
    status: api.status,
    reviewedAt: api.reviewedAt ? new Date(api.reviewedAt) : null,
    minBibConfidence: api.minBibConfidence,
    bibsCount: api.bibsCount,
    colorsCount: api.colorsCount,
  }
}
