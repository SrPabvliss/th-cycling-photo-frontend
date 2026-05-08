import type { PhotoStatus } from '@/shared/types/photo-enums'
import type { IApiPhotoDetail, IPhotoDetail } from '../types/responses/photo-detail.response'

export function toPhotoDetail(api: IApiPhotoDetail): IPhotoDetail {
  return {
    id: api.id,
    eventId: api.eventId,
    eventSlug: api.eventSlug,
    filename: api.filename,
    publicSlug: api.publicSlug,
    imageUrl: api.imageUrl,
    thumbnailUrl: api.thumbnailUrl,
    fileSize: api.fileSize,
    mimeType: api.mimeType,
    width: api.width,
    height: api.height,
    status: api.status as PhotoStatus,
    retouchedImageUrl: api.retouchedImageUrl,
    retouchedFileSize: api.retouchedFileSize,
    retouchedAt: api.retouchedAt ? new Date(api.retouchedAt) : null,
    capturedAt: api.capturedAt ? new Date(api.capturedAt) : null,
    uploadedAt: new Date(api.uploadedAt),
    processedAt: api.processedAt ? new Date(api.processedAt) : null,
    reviewedAt: api.reviewedAt ? new Date(api.reviewedAt) : null,
  }
}
