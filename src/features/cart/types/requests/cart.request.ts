export interface IAddToCartRequest {
  photoId: string
  sessionId?: string
}

export interface ICheckoutEventItem {
  eventId: string
}

export interface ICheckoutRequest {
  items: ICheckoutEventItem[]
}

export interface ICheckoutOrderResult {
  orderId: string
  eventName: string
  photoCount: number
}
