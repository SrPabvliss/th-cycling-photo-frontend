import type { PaymentMethod } from '@/shared/types/payment-method.types'

/** Body of POST /preview/:token/orders — billed like a cart checkout */
export interface ICreateOrderRequest {
  photoIds: string[]
  notes?: string | null
  bibNumber?: string | null
  snapCategoryName?: string | null
  billingAccountId: string
  method: PaymentMethod
}
