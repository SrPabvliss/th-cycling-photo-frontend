import type {
  PayoutMethodAccountType,
  PayoutMethodProvider,
} from '@/features/tenant-profile/types/responses/payout-method.response'
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
  publicSlug: string
  thumbnailUrl: string
  fullUrl: string
}

export interface IApiOrderDetailDeliveryLink {
  token: string
  status: string
  expiresAt: string
  downloadCount: number
  whatsappTemplate: string
}

/** Shared shape: no dates or decimals, so it serves both the API and domain types */
export interface IOrderPayoutMethod {
  provider: PayoutMethodProvider
  isActive: boolean
  sortOrder: number
  receiverIdentifier: string | null
  bankName: string | null
  accountNumber: string | null
  accountType: PayoutMethodAccountType | null
  accountHolder: string | null
  holderIdentification: string | null
}

/** API projection from GET /orders/:id */
export interface IApiOrderDetail {
  id: string
  status: string
  notes: string | null
  createdAt: string
  notifiedAt: string | null
  paidAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  userName: string
  snapFirstName: string | null
  snapLastName: string | null
  snapWhatsapp: string | null
  customerPrimaryPhone: string | null
  snapEmail: string | null
  previewLinkToken: string | null
  eventName: string
  organizerName: string
  subtotal: string | null
  snapCurrency: string | null
  paymentMethod: string | null
  photos: IApiOrderDetailPhoto[]
  deliveryLink: IApiOrderDetailDeliveryLink | null
  retouchProgress?: { total: number; retouched: number }
  payoutMethods?: IOrderPayoutMethod[]
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
  whatsappTemplate: string
}

/** Frontend domain type */
export interface IOrderDetail {
  id: string
  status: OrderStatus
  notes: string | null
  createdAt: Date
  notifiedAt: Date | null
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
  organizerName: string
  subtotal: number | null
  subtotalDecimal: string | null
  customerPrimaryPhone: string | null
  snapCurrency: string | null
  paymentMethod: string | null
  photos: IOrderDetailPhoto[]
  deliveryLink: IOrderDetailDeliveryLink | null
  retouchProgress?: { total: number; retouched: number }
  payoutMethods?: IOrderPayoutMethod[]
}
