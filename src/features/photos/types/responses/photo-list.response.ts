import type { PhotoStatus } from '@/shared/types/photo-enums'

export type { PhotoStatus }

export interface IApiPhotoListItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string
  status: string
  uploadedAt: string
  reviewedAt: string | null
}

export interface IPhotoListItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string
  status: PhotoStatus
  uploadedAt: Date
  reviewedAt: Date | null
}
