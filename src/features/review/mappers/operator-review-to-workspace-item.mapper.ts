import type { IOperatorReviewQueueItem } from '@/features/operator/types/responses/operator-review-queue-item.response'
import type { IWorkspaceQueueItem } from '@/features/workspace/types/workspace-queue-item.types'

/**
 * Adapts an operator review queue item (which carries cross-event metadata)
 * to the generic workspace queue item shape consumed by the shell. Drops the
 * operator-specific `event` field; the shell does not need it.
 */
export function toWorkspaceQueueItemFromOperatorReview(
  item: IOperatorReviewQueueItem,
): IWorkspaceQueueItem {
  return {
    id: item.id,
    publicSlug: item.publicSlug,
    filename: item.filename,
    thumbnailUrl: item.thumbnailUrl,
    status: item.status,
    reviewedAt: item.reviewedAt,
    minBibConfidence: item.minBibConfidence,
    bibsCount: item.bibsCount,
    colorsCount: item.colorsCount,
  }
}
