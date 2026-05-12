export interface IApiOperatorRetouchOrderDetailPhoto {
  photoId: string
  publicSlug: string
  filename: string
  thumbnailUrl: string
  isRetouched: boolean
}

export interface IApiOperatorRetouchOrderDetail {
  orderId: string
  buyerName: string
  eventId: string
  eventName: string
  createdAt: string
  photos: IApiOperatorRetouchOrderDetailPhoto[]
}

export interface IOperatorRetouchOrderDetailPhoto {
  photoId: string
  publicSlug: string
  filename: string
  thumbnailUrl: string
  isRetouched: boolean
}

export interface IOperatorRetouchOrderDetail {
  orderId: string
  buyerName: string
  eventId: string
  eventName: string
  createdAt: Date
  photos: IOperatorRetouchOrderDetailPhoto[]
}
