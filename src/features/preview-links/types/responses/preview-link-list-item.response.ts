export type PreviewLinkStatus = 'active' | 'expired' | 'converted'

/** API projection from GET /events/:eventId/preview-links */
export interface IApiPreviewLinkListItem {
  id: string
  token: string
  status: string
  expiresAt: string
  viewedAt: string | null
  createdAt: string
  photoCount: number
  orderCount: number
}

/** Frontend domain type with parsed dates and typed status */
export interface IPreviewLinkListItem {
  id: string
  token: string
  status: PreviewLinkStatus
  expiresAt: Date
  viewedAt: Date | null
  createdAt: Date
  photoCount: number
  orderCount: number
}
