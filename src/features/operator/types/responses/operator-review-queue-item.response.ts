import type { PhotoStatus } from '@/shared/types/photo-enums'

export interface IApiOperatorReviewQueueItemEvent {
  id: string
  slug: string
  name: string
}

export interface IApiOperatorReviewQueueItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string | null
  status: PhotoStatus
  reviewedAt: string | null
  minBibConfidence: number | null
  bibsCount: number
  colorsCount: number
  event: IApiOperatorReviewQueueItemEvent
}

export interface IOperatorReviewQueueItemEvent {
  id: string
  slug: string
  name: string
}

export interface IOperatorReviewQueueItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string | null
  status: PhotoStatus
  reviewedAt: Date | null
  minBibConfidence: number | null
  bibsCount: number
  colorsCount: number
  event: IOperatorReviewQueueItemEvent
}
