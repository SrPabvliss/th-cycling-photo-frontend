import type { PhotoStatus } from '@/shared/types/photo-enums'

export interface IApiPhotoView {
  eventSlug: string
  filename: string
  imageUrl: string
  fileSize: number
  mimeType: string
  status: string
  uploadedAt: string
  processedAt: string | null
  reviewedAt: string | null
}

export interface IPhotoView {
  eventSlug: string
  filename: string
  imageUrl: string
  fileSize: number
  mimeType: string
  status: PhotoStatus
  uploadedAt: Date
  processedAt: Date | null
  reviewedAt: Date | null
}
