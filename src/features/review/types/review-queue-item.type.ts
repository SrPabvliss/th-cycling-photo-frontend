import type { PhotoStatus } from '@/shared/types/photo-enums'

export interface IReviewQueueItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string | null
  status: PhotoStatus
  reviewedAt: Date | null
  minBibConfidence: number | null
  bibsCount: number
  colorsCount: number
}
