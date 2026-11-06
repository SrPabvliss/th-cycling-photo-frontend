/** API projection from POST /events/:eventId/preview-links */
export interface IApiPreviewLinkCreated {
  id: string
  token: string
  previewUrl: string
  shareTemplate: string
  expiresAt: string
}

/** Frontend domain type with the expiry parsed */
export interface IPreviewLinkCreated {
  id: string
  token: string
  previewUrl: string
  shareTemplate: string
  expiresAt: Date
}
