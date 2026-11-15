export type PreviewStatus = 'active' | 'expired' | 'converted'

export interface IApiPreviewPhoto {
  id: string
  url: string
  /** Already in one of the signed-in buyer's orders. Only true with a valid session. */
  alreadyPurchased?: boolean
}

/** API projection from GET /preview/:token */
export interface IApiPreviewData {
  token: string
  eventId: string
  eventTypeId: number
  organizerName: string
  eventName: string
  startDate: string
  endDate: string
  status: string
  expiresAt: string
  photos: IApiPreviewPhoto[]
  /** The live order of this link, only when the one looking (signed in) placed it. */
  myOrderId?: string | null
}

export interface IPreviewPhoto {
  id: string
  url: string
  /** Already bought by this buyer: shown, but not offered again. */
  alreadyPurchased?: boolean
}

/** Frontend domain type with parsed dates and typed status */
export interface IPreviewData {
  token: string
  eventId: string
  eventTypeId: number
  organizerName: string
  eventName: string
  startDate: Date
  endDate: Date
  status: PreviewStatus
  expiresAt: Date
  photos: IPreviewPhoto[]
  /** The live order of this link, only when the one looking placed it. */
  myOrderId: string | null
}
