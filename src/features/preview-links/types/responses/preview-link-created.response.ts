/** API projection from POST /events/:eventId/preview-links */
export interface IApiPreviewLinkCreated {
  id: string
  token: string
  previewUrl: string
  shareTemplate: string
}

/** Frontend domain type — no transformation needed, all fields are strings */
export interface IPreviewLinkCreated {
  id: string
  token: string
  previewUrl: string
  shareTemplate: string
}
