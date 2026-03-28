import type { OrderStatus } from './order-list.response'

export const DELIVERY_LINK_STATUS = {
  ACTIVE: 'active',
  DOWNLOADED: 'downloaded',
  EXPIRED: 'expired',
} as const

export type DeliveryLinkStatus = (typeof DELIVERY_LINK_STATUS)[keyof typeof DELIVERY_LINK_STATUS]

export interface IApiOrderDetailCustomer {
  id: string
  firstName: string
  lastName: string
  whatsapp: string
  email: string | null
}

export interface IApiOrderDetailPhoto {
  id: string
  filename: string
  storageKey: string
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
  customer: IApiOrderDetailCustomer
  eventName: string
  previewLinkToken: string
  photos: IApiOrderDetailPhoto[]
  deliveryLink: IApiOrderDetailDeliveryLink | null
}

export interface IOrderDetailCustomer {
  id: string
  firstName: string
  lastName: string
  whatsapp: string
  email: string | null
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
  customer: IOrderDetailCustomer
  eventName: string
  previewLinkToken: string
  photos: IOrderDetailPhoto[]
  deliveryLink: IOrderDetailDeliveryLink | null
}
