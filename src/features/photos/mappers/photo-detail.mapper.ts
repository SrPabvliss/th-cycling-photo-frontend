import { getPhotoUrl } from '@/shared/utils/cdn.utils'

import type { PhotoStatus } from '../types/responses/photo-list.response'
import type { IApiPhotoDetail, IPhotoDetail } from '../types/responses/photo-detail.response'

export function toPhotoDetail(api: IApiPhotoDetail): IPhotoDetail {
  return {
    id: api.id,
    eventId: api.eventId,
    filename: api.filename,
    imageUrl: getPhotoUrl(api.storageKey),
    fileSize: api.fileSize,
    mimeType: api.mimeType,
    width: api.width,
    height: api.height,
    status: api.status as PhotoStatus,
    unclassifiedReason: api.unclassifiedReason,
    capturedAt: api.capturedAt ? new Date(api.capturedAt) : null,
    uploadedAt: new Date(api.uploadedAt),
    processedAt: api.processedAt ? new Date(api.processedAt) : null,
  }
}
