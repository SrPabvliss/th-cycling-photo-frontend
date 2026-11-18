export const DELIVERY_STATUS = {
  ACTIVE: 'active',
  DOWNLOADED: 'downloaded',
  EXPIRED: 'expired',
} as const

export type DeliveryStatus = (typeof DELIVERY_STATUS)[keyof typeof DELIVERY_STATUS]

export interface IApiDeliveryPhoto {
  id: string
  filename: string
  downloadUrl: string
  fileSize: number
  /** Small image of the photo itself (TIT-116). Lasts an hour; may be missing, null or fail. */
  thumbnailUrl?: string | null
  /** The photo at screen size, without watermark, to look at it in full screen. Same lifetime. */
  viewUrl?: string | null
}

/** API projection from GET /delivery/:token */
export interface IApiDeliveryData {
  token: string
  eventName: string
  status: string
  expiresAt: string | null
  downloadCount: number
  /** The order was paid and has an invoice. Optional: older api versions do not send it. */
  invoiced?: boolean
  photos: IApiDeliveryPhoto[]
}

export interface IDeliveryPhoto {
  id: string
  filename: string
  downloadUrl: string
  fileSize: number
  thumbnailUrl: string | null
  /** What the full-screen viewer shows: the screen-size image, or the thumbnail without it. */
  viewUrl: string | null
}

/** Frontend domain type */
export interface IDeliveryData {
  token: string
  eventName: string
  status: DeliveryStatus
  /** Null when the api does not say when the link ends. */
  expiresAt: Date | null
  downloadCount: number
  /** The order was paid: its invoice went to the buyer's email. */
  invoiced: boolean
  photos: IDeliveryPhoto[]
}
