import type { PhotoStatus } from '@/shared/types/photo-enums'

/**
 * Common shape of a queue item rendered inside the workspace shell.
 * Both review and (eventually) retouch flows produce items that fit this
 * shape; feature-specific fields live in their own response types and are
 * not part of the shell contract.
 */
export interface IWorkspaceQueueItem {
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
