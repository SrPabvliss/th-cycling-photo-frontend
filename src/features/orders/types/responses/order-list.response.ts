export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export interface IApiOrderPreviewPhoto {
  photoId: string
  publicSlug: string
  thumbnailUrl: string
  filename: string
}

export interface IOrderPreviewPhoto {
  photoId: string
  publicSlug: string
  thumbnailUrl: string
  filename: string
}

/** API projection from GET /orders */
export interface IApiOrderListItem {
  id: string
  status: string
  createdAt: string
  paidAt: string | null
  deliveredAt: string | null
  userName: string
  snapWhatsapp: string | null
  eventName: string
  photoCount: number
  hasDeliveryLink: boolean
  previewPhotos: IApiOrderPreviewPhoto[]
}

/** Frontend domain type with parsed dates and typed status */
export interface IOrderListItem {
  id: string
  status: OrderStatus
  createdAt: Date
  paidAt: Date | null
  deliveredAt: Date | null
  userName: string
  snapWhatsapp: string | null
  eventName: string
  photoCount: number
  hasDeliveryLink: boolean
  previewPhotos: IOrderPreviewPhoto[]
}
