import type { PhotoStatus } from './photo-list.response'

export interface IApiPhotoView {
  eventSlug: string
  filename: string
  imageUrl: string
  fileSize: number
  mimeType: string
  status: string
  unclassifiedReason: string | null
  uploadedAt: string
  processedAt: string | null
}

export interface IPhotoView {
  eventSlug: string
  filename: string
  imageUrl: string
  fileSize: number
  mimeType: string
  status: PhotoStatus
  unclassifiedReason: string | null
  uploadedAt: Date
  processedAt: Date | null
}
