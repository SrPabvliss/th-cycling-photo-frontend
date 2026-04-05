/** API projection from GET /photos/pending-retouch */
export interface IApiPendingRetouchPhoto {
  id: string
  filename: string
  thumbnailUrl: string
  isRetouched: boolean
}

export interface IApiPendingRetouchGroup {
  orderId: string
  orderCreatedAt: string
  eventName: string
  userName: string
  photos: IApiPendingRetouchPhoto[]
}

/** Frontend domain types */
export interface IPendingRetouchPhoto {
  id: string
  filename: string
  thumbnailUrl: string
  isRetouched: boolean
}

export interface IPendingRetouchGroup {
  orderId: string
  orderCreatedAt: Date
  eventName: string
  userName: string
  photos: IPendingRetouchPhoto[]
}
