import type {
  IApiOperatorReviewQueueItem,
  IOperatorReviewQueueItem,
} from '../types/responses/operator-review-queue-item.response'

export function toOperatorReviewQueueItem(
  api: IApiOperatorReviewQueueItem,
): IOperatorReviewQueueItem {
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
    event: { ...api.event },
  }
}
