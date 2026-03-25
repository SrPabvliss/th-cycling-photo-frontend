export type PreviewStatus = 'active' | 'expired' | 'converted'

export interface IApiPreviewPhoto {
  id: string
  url: string
}

/** API projection from GET /preview/:token */
export interface IApiPreviewData {
  token: string
  eventName: string
  eventDate: string
  status: string
  expiresAt: string
  photos: IApiPreviewPhoto[]
}

export interface IPreviewPhoto {
  id: string
  url: string
}

/** Frontend domain type with parsed dates and typed status */
export interface IPreviewData {
  token: string
  eventName: string
  eventDate: Date
  status: PreviewStatus
  expiresAt: Date
  photos: IPreviewPhoto[]
}
