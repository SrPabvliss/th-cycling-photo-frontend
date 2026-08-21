export type MyOrderState = 'in_process' | 'ready' | 'gifted' | 'cancelled'

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
}

export interface IApiMyOrderDownloadPhoto {
  id: string
  filename: string
  fileSize: number
  downloadUrl: string
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
}

export interface IMyOrderDownloads {
  orderId: string
  photos: IApiMyOrderDownloadPhoto[]
}

export interface IApiMyOrdersSummarySpent {
  currency: string
  amount: string
}

export interface IApiMyOrdersSummary {
  orderCount: number
  photoCount: number
  eventCount: number
  spent: IApiMyOrdersSummarySpent[]
}

export interface IMyOrdersSummarySpent {
  currency: string
  amount: string
}

export interface IMyOrdersSummary {
  orderCount: number
  photoCount: number
  eventCount: number
  spent: IMyOrdersSummarySpent[]
}
