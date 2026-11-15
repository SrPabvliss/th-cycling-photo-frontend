export interface ICartPhoto {
  id: string
  publicSlug: string
  /** Already in one of the buyer's orders: it cannot be ordered again, only taken out. */
  alreadyPurchased?: boolean
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
