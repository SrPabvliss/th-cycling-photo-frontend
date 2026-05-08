import type { PhotoStatus } from '@/shared/types/photo-enums'

export interface IApiPhotoDetail {
  id: string
  eventId: string
  eventSlug: string
  filename: string
  publicSlug: string
  imageUrl: string
  thumbnailUrl: string
  fileSize: number
  mimeType: string
  width: number | null
  height: number | null
  status: string
  retouchedImageUrl: string | null
  retouchedFileSize: number | null
  retouchedAt: string | null
  capturedAt: string | null
  uploadedAt: string
  processedAt: string | null
  reviewedAt: string | null
}

export interface IPhotoDetail {
  id: string
  eventId: string
  eventSlug: string
  filename: string
  publicSlug: string
  imageUrl: string
  thumbnailUrl: string
  fileSize: number
  mimeType: string
  width: number | null
  height: number | null
  status: PhotoStatus
  retouchedImageUrl: string | null
  retouchedFileSize: number | null
  retouchedAt: Date | null
  capturedAt: Date | null
  uploadedAt: Date
  processedAt: Date | null
  reviewedAt: Date | null
}
