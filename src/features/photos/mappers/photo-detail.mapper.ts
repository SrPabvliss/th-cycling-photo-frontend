import type { PhotoStatus } from '@/shared/types/photo-enums'
import type {
  IApiBibAttribute,
  IApiColorAttribute,
  IApiPhotoDetail,
  IBibAttribute,
  IColorAttribute,
  IPhotoDetail,
} from '../types/responses/photo-detail.response'

const toBib = (b: IApiBibAttribute): IBibAttribute => ({
  id: b.id,
  digits: b.digits,
  status: b.status,
  confidence: b.confidence,
  source: b.source,
  cropUrl: b.cropUrl,
})

const toColor = (c: IApiColorAttribute): IColorAttribute => ({
  id: c.id,
  region: c.region,
  primaryColor: c.primaryColor,
  secondaryColor: c.secondaryColor,
  confidence: c.confidence,
  source: c.source,
  cropUrl: c.cropUrl,
})

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
    bibs: api.bibs.map(toBib),
    colors: api.colors.map(toColor),
  }
}
