export type PhotoStatus = 'pending' | 'detecting' | 'analyzing' | 'completed' | 'failed'

/** API projection from GET /events/:eventId/photos */
export interface IApiPhotoListItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string
  status: string
  uploadedAt: string
  classifiedAt: string | null
}

/** Frontend domain type with typed status */
export interface IPhotoListItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string
  status: PhotoStatus
  uploadedAt: Date
  classifiedAt: Date | null
}
