import type { PaymentMethod } from '@/shared/types/payment-method.types'

/** Body of POST /preview/:token/orders, billed like a cart checkout. */
export interface ICreateOrderRequest {
  photoIds: string[]
  billingAccountId: string
  method: PaymentMethod
}
