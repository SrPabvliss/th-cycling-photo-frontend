import type { PaymentMethod } from '@/shared/types/payment-method.types'
import type { ICreateOrderRequest } from '../types/requests/create-order.request'

// Category, plate and notes are no longer asked for: only what the order needs.
export function toCreateOrderRequest(input: {
  photoIds: string[]
  billingAccountId: string
  method: PaymentMethod
}): ICreateOrderRequest {
  return {
    photoIds: [...input.photoIds],
    billingAccountId: input.billingAccountId,
    method: input.method,
  }
}
