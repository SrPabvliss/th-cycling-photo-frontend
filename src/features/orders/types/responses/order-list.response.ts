export const ORDER_STATUS = {
  PENDING: 'pending',
  PAYMENT_INFO_SENT: 'payment_info_sent',
  PAID: 'paid',
  DELIVERED: 'delivered',
  GIFTED: 'gifted',
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
  notifiedAt: string | null
  paidAt: string | null
  deliveredAt: string | null
  userName: string
  userId: string
  customerFirstName: string | null
  customerLastName: string | null
  customerEmail: string
  customerPrimaryPhone: string | null
  snapWhatsapp: string | null
  eventName: string
  photoCount: number
  hasDeliveryLink: boolean
  subtotal: string | null
  snapCurrency: string | null
  paymentMethod: string | null
  previewPhotos: IApiOrderPreviewPhoto[]
}

/** Frontend domain type with parsed dates and typed status */
export interface IOrderListItem {
  id: string
  status: OrderStatus
  createdAt: Date
  notifiedAt: Date | null
  paidAt: Date | null
  deliveredAt: Date | null
  userName: string
  userId: string
  customerFirstName: string | null
  customerLastName: string | null
  customerEmail: string
  customerPrimaryPhone: string | null
  snapWhatsapp: string | null
  eventName: string
  photoCount: number
  hasDeliveryLink: boolean
  subtotal: number | null
  snapCurrency: string | null
  paymentMethod: string | null
  previewPhotos: IOrderPreviewPhoto[]
}
