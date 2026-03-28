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
}

/** API projection from GET /delivery/:token */
export interface IApiDeliveryData {
  token: string
  eventName: string
  customerName: string
  status: string
  expiresAt: string
  downloadCount: number
  photos: IApiDeliveryPhoto[]
}

export interface IDeliveryPhoto {
  id: string
  filename: string
  downloadUrl: string
  fileSize: number
}

/** Frontend domain type */
export interface IDeliveryData {
  token: string
  eventName: string
  customerName: string
  status: DeliveryStatus
  expiresAt: Date
  downloadCount: number
  photos: IDeliveryPhoto[]
}
