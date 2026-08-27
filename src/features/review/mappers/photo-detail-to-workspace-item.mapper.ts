import type { IPhotoDetail } from '@/shared/types/photo-detail.types'
import type { IWorkspaceQueueItem } from '@/shared/workspace/types/workspace-queue-item.types'

/**
 * Adapts a photo detail response to a single workspace queue item. Used by
 * the edit-one workspace mode where the queue is built from the photo
 * detail itself instead of a list endpoint.
 */
export function toWorkspaceQueueItemFromPhotoDetail(detail: IPhotoDetail): IWorkspaceQueueItem {
  return {
    id: detail.id,
    publicSlug: detail.publicSlug,
    filename: detail.filename,
    thumbnailUrl: null,
    status: detail.status,
    reviewedAt: detail.reviewedAt,
    minBibConfidence: null,
    bibsCount: detail.bibs.length,
    colorsCount: detail.colors.length,
  }
}
