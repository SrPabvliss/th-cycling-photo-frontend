import type { PaymentMethod } from '@/shared/types/payment-method.types'

export interface IAddToCartRequest {
  photoId: string
  sessionId?: string
}

export interface ICheckoutEventItem {
  eventId: string
}

export interface ICheckoutRequest {
  items: ICheckoutEventItem[]
  method: PaymentMethod
}

export interface ICheckoutOrderResult {
  orderId: string
  eventName: string
  photoCount: number
  subtotal: number
  currency: string
}
