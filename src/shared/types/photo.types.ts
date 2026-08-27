import type { PhotoStatus } from '@/shared/types/photo-enums'

export type { PhotoStatus }

export interface IApiPhotoBib {
  digits: string
  source: 'ai' | 'reviewer'
  confidence: number | null
  status: 'read' | 'abstained' | null
  corrected: boolean
}

export type IPhotoBib = IApiPhotoBib

export interface IApiPhotoListItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string
  status: string
  uploadedAt: string
  reviewedAt: string | null
  bibs: IApiPhotoBib[]
  photoCategoryId: number | null
  photoCategoryName: string | null
  sold: boolean
}

export interface IPhotoListItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string
  status: PhotoStatus
  uploadedAt: Date
  reviewedAt: Date | null
  bibs: IPhotoBib[]
  photoCategoryId: number | null
  photoCategoryName: string | null
  sold: boolean
}
