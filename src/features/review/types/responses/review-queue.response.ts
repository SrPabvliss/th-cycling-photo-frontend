import type { PhotoStatus } from '@/shared/types/photo-enums'
import type { IReviewQueueItem } from '../review-queue-item.type'

export interface IApiReviewQueueItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string | null
  status: PhotoStatus
  reviewedAt: string | null
  minBibConfidence: number | null
  bibsCount: number
  colorsCount: number
}

export interface IReviewQueueResponse {
  items: IReviewQueueItem[]
  total: number
  pagination: { page: number; limit: number }
  totalPages: number
}
