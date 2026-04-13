import type { OrderStatus } from './order-list.response'

export const DELIVERY_LINK_STATUS = {
  ACTIVE: 'active',
  DOWNLOADED: 'downloaded',
  EXPIRED: 'expired',
} as const

export type DeliveryLinkStatus = (typeof DELIVERY_LINK_STATUS)[keyof typeof DELIVERY_LINK_STATUS]

export interface IApiOrderDetailPhoto {
  id: string
  filename: string
  storageKey: string
  publicSlug: string
}

export interface IApiOrderDetailDeliveryLink {
  token: string
  status: string
  expiresAt: string
  downloadCount: number
}

/** API projection from GET /orders/:id */
export interface IApiOrderDetail {
  id: string
  status: string
  notes: string | null
  createdAt: string
  paidAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  userName: string
  snapFirstName: string | null
  snapLastName: string | null
  snapWhatsapp: string | null
  snapEmail: string | null
  previewLinkToken: string | null
  eventName: string
  photos: IApiOrderDetailPhoto[]
  deliveryLink: IApiOrderDetailDeliveryLink | null
  retouchProgress?: { total: number; retouched: number }
}

export interface IOrderDetailPhoto {
  id: string
  filename: string
  thumbnailUrl: string
  fullUrl: string
}

export interface IOrderDetailDeliveryLink {
  token: string
  status: DeliveryLinkStatus
  expiresAt: Date
  downloadCount: number
}

/** Frontend domain type */
export interface IOrderDetail {
  id: string
  status: OrderStatus
  notes: string | null
  createdAt: Date
  paidAt: Date | null
  deliveredAt: Date | null
  cancelledAt: Date | null
  userName: string
  snapFirstName: string | null
  snapLastName: string | null
  snapWhatsapp: string | null
  snapEmail: string | null
  previewLinkToken: string | null
  eventName: string
  photos: IOrderDetailPhoto[]
  deliveryLink: IOrderDetailDeliveryLink | null
  retouchProgress?: { total: number; retouched: number }
}
