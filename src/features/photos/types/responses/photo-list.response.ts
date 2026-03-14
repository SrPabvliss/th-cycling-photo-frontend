export type PhotoStatus = 'pending' | 'detecting' | 'analyzing' | 'completed' | 'failed'

/** API projection from GET /events/:eventId/photos — already camelCase from backend */
export interface IApiPhotoListItem {
  id: string
  eventId: string
  filename: string
  storageKey: string
  status: string
  width: number | null
  height: number | null
  uploadedAt: string
  classifiedAt: string | null
}

/** Frontend domain type with resolved CDN URL and typed status */
export interface IPhotoListItem {
  id: string
  eventId: string
  filename: string
  thumbnailUrl: string
  status: PhotoStatus
  width: number | null
  height: number | null
  uploadedAt: Date
  classifiedAt: Date | null
}
