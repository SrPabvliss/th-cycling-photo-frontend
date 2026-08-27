import type { PhotoStatus } from '@/shared/types/photo-enums'
import { normalizeColor } from '@/shared/utils/color.utils'
import type {
  IApiBibAttribute,
  IApiColorAttribute,
  IApiPhotoDetail,
  IApiPhotoOrder,
  IBibAttribute,
  IColorAttribute,
  IPhotoDetail,
  IPhotoOrder,
} from '../types/responses/photo-detail.response'
import type { IPhotoListItem } from '../types/responses/photo-list.response'

const toBib = (b: IApiBibAttribute): IBibAttribute => ({
  id: b.id,
  digits: b.digits,
  status: b.status,
  confidence: b.confidence,
  source: b.source,
  cropUrl: b.cropUrl,
  digitsOriginal: b.digitsOriginal,
  wasCorrected: b.wasCorrected,
  correctedAt: b.correctedAt ? new Date(b.correctedAt) : null,
  correctedByName: b.correctedByName ?? null,
})

const toOrder = (o: IApiPhotoOrder): IPhotoOrder => ({
  id: o.id,
  buyerName: o.buyerName,
  createdAt: new Date(o.createdAt),
  status: o.status,
})

const toColor = (c: IApiColorAttribute): IColorAttribute => ({
  id: c.id,
  region: c.region,
  primaryColor: normalizeColor(c.primaryColor) as string,
  secondaryColor: normalizeColor(c.secondaryColor),
  confidence: c.confidence,
  source: c.source,
  cropUrl: c.cropUrl,
  primaryColorOriginal: normalizeColor(c.primaryColorOriginal) as string,
  primaryWasCorrected: c.primaryWasCorrected,
  secondaryColorOriginal: normalizeColor(c.secondaryColorOriginal),
  secondaryWasCorrected: c.secondaryWasCorrected,
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
    photoCategoryId: api.photoCategoryId ?? null,
    photoCategoryName: api.photoCategoryName ?? null,
    orders: (api.orders ?? []).map(toOrder),
    position: api.position ?? 1,
    eventPhotoCount: api.eventPhotoCount ?? 1,
    previousSlug: api.previousSlug ?? null,
    nextSlug: api.nextSlug ?? null,
  }
}

export function photoDetailToListItem(photo: IPhotoDetail): IPhotoListItem {
  return {
    id: photo.id,
    publicSlug: photo.publicSlug,
    filename: photo.filename,
    thumbnailUrl: photo.thumbnailUrl,
    status: photo.status,
    uploadedAt: photo.uploadedAt,
    reviewedAt: photo.reviewedAt,
    bibs: photo.bibs.map((bib) => ({
      digits: bib.digits,
      source: bib.source,
      confidence: bib.confidence,
      status: bib.status,
      corrected: bib.wasCorrected,
    })),
    photoCategoryId: photo.photoCategoryId,
    photoCategoryName: photo.photoCategoryName,
    sold: photo.orders.length > 0,
  }
}
