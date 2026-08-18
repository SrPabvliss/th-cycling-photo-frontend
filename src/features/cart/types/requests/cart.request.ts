import type { PaymentMethod } from '@/features/payments/types/payment-method'

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
