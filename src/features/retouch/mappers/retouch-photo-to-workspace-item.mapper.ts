import type { IOperatorRetouchOrderDetailPhoto } from '../types/responses/operator-retouch-order-detail.response'
import type { IWorkspaceQueueItem } from '@/shared/workspace/types/workspace-queue-item.types'

export function toWorkspaceQueueItemFromRetouchPhoto(
  photo: IOperatorRetouchOrderDetailPhoto,
): IWorkspaceQueueItem {
  return {
    id: photo.photoId,
    publicSlug: photo.publicSlug,
    filename: photo.filename,
    thumbnailUrl: photo.thumbnailUrl,
    status: 'reviewed',
    reviewedAt: null,
    minBibConfidence: null,
    bibsCount: 0,
    colorsCount: 0,
    isRetouched: photo.isRetouched,
  }
}
