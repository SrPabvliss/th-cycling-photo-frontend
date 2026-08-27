import type { OrderStatus } from '@/shared/types/order-status.types'

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
  cancelledAt: string | null
  eventId: string
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
  cancelledAt: Date | null
  eventId: string
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
  subtotalDecimal: string | null
  snapCurrency: string | null
  paymentMethod: string | null
  previewPhotos: IOrderPreviewPhoto[]
}
