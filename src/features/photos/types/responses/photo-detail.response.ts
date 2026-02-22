import type { PhotoStatus } from './photo-list.response'

/** API projection from GET /photos/:id — already camelCase from backend */
export interface IApiPhotoDetail {
  id: string
  eventId: string
  filename: string
  storageKey: string
  fileSize: number
  mimeType: string
  width: number | null
  height: number | null
  status: string
  unclassifiedReason: string | null
  capturedAt: string | null
  uploadedAt: string
  processedAt: string | null
  detectedCyclists: unknown[]
}

/** Frontend domain type with resolved CDN URL and parsed dates */
export interface IPhotoDetail {
  id: string
  eventId: string
  filename: string
  imageUrl: string
  fileSize: number
  mimeType: string
  width: number | null
  height: number | null
  status: PhotoStatus
  unclassifiedReason: string | null
  capturedAt: Date | null
  uploadedAt: Date
  processedAt: Date | null
}
