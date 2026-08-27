export interface ICartPhoto {
  id: string
  publicSlug: string
}

export interface ICartGroup {
  eventId: string
  eventName: string
  eventSlug: string
  startDate: Date
  endDate: Date
  photos: ICartPhoto[]
}

export interface ICheckoutOrderResult {
  orderId: string
  eventName: string
  photoCount: number
  subtotal: number
  currency: string
}
