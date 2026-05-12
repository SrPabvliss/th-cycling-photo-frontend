export type TRetouchOrderScope = 'pending' | 'completed'

export interface IApiOperatorRetouchPreviewPhoto {
  photoId: string
  publicSlug: string
  thumbnailUrl: string
  filename: string
}

export interface IApiOperatorRetouchOrder {
  orderId: string
  buyerName: string
  eventId: string
  eventName: string
  createdAt: string
  pendingPhotosCount: number
  totalPhotosCount: number
  retouchedPhotosCount: number
  previewPhotos: IApiOperatorRetouchPreviewPhoto[]
}

export interface IOperatorRetouchPreviewPhoto {
  photoId: string
  publicSlug: string
  thumbnailUrl: string
  filename: string
}

export interface IOperatorRetouchOrder {
  orderId: string
  buyerName: string
  eventId: string
  eventName: string
  createdAt: Date
  pendingPhotosCount: number
  totalPhotosCount: number
  retouchedPhotosCount: number
  previewPhotos: IOperatorRetouchPreviewPhoto[]
}

export interface IOperatorRetouchOrdersPage {
  items: IOperatorRetouchOrder[]
  total: number
  page: number
  limit: number
  totalPages: number
}
