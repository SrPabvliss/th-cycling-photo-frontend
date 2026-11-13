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
}

/** API projection from GET /delivery/:token */
export interface IApiDeliveryData {
  token: string
  eventName: string
  customerName: string
  status: string
  expiresAt: string | null
  downloadCount: number
  photos: IApiDeliveryPhoto[]
}

export interface IDeliveryPhoto {
  id: string
  filename: string
  downloadUrl: string
  fileSize: number
  thumbnailUrl: string | null
}

/** Frontend domain type */
export interface IDeliveryData {
  token: string
  eventName: string
  customerName: string
  status: DeliveryStatus
  /** Null when the api does not say when the link ends. */
  expiresAt: Date | null
  downloadCount: number
  photos: IDeliveryPhoto[]
}
