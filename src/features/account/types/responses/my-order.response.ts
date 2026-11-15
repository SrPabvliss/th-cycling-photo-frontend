import type { BillingIdType } from './billing-account.response'
import type { IApiMyOrderInvoice, IMyOrderInvoice } from './my-order-invoice.response'

/** `confirming`: a card payment is being confirmed with the gateway. */
export type MyOrderState = 'in_process' | 'confirming' | 'ready' | 'gifted' | 'cancelled'

export interface IApiMyOrderPreviewPhoto {
  photoId: string
  galleryUrl: string
}

export interface IApiMyOrderListItem {
  id: string
  state: MyOrderState
  eventName: string
  createdAt: string
  photoCount: number
  subtotal: string | null
  snapCurrency: string | null
  previewPhotos: IApiMyOrderPreviewPhoto[]
}

export interface IApiMyOrderPhoto {
  id: string
  galleryUrl: string
}

export interface IMyOrderBilling {
  idType: BillingIdType
  idNumber: string
  legalName: string
  email: string
  address: string | null
}

export interface IApiMyOrderDetail {
  id: string
  state: MyOrderState
  eventName: string
  createdAt: string
  subtotal: string | null
  snapCurrency: string | null
  canDownload: boolean
  canCancel: boolean
  photos: IApiMyOrderPhoto[]
  invoice: IApiMyOrderInvoice | null
  billing: IMyOrderBilling | null
  /** Card payment being confirmed; null otherwise. */
  confirmingTransactionId: string | null
  /** How it is paid. Optional: older api versions do not send it. */
  paymentMethod?: 'card' | 'transfer' | null
  /** Public gallery of the event; null when it is no longer listed. Optional, like above. */
  eventSlug?: string | null
}

export interface IApiMyOrderDownloadPhoto {
  id: string
  filename: string
  fileSize: number
  downloadUrl: string
  /** Small image of the photo itself (TIT-116). Lasts an hour; may be null or fail. */
  thumbnailUrl?: string | null
}

export interface IApiMyOrderDownloads {
  orderId: string
  photos: IApiMyOrderDownloadPhoto[]
}

export interface IMyOrderListItem {
  id: string
  state: MyOrderState
  eventName: string
  createdAt: string
  photoCount: number
  subtotal: string | null
  currency: string | null
  previewPhotos: IApiMyOrderPreviewPhoto[]
}

export interface IMyOrderDetail {
  id: string
  state: MyOrderState
  eventName: string
  createdAt: string
  subtotal: string | null
  currency: string | null
  canDownload: boolean
  canCancel: boolean
  photos: IApiMyOrderPhoto[]
  invoice: IMyOrderInvoice | null
  billing: IMyOrderBilling | null
  /** Card payment being confirmed; null otherwise. */
  confirmingTransactionId: string | null
  /** How it is paid. Optional: older api versions do not send it. */
  paymentMethod?: 'card' | 'transfer' | null
  /** Public gallery of the event; null when it is no longer listed. Optional, like above. */
  eventSlug?: string | null
}

export interface IMyOrderDownloads {
  orderId: string
  photos: IApiMyOrderDownloadPhoto[]
}
