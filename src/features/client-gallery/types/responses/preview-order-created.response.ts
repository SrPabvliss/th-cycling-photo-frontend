import type { PaymentMethod } from '@/shared/types/payment-method.types'

/** API projection from POST /preview/:token/orders */
export interface IApiPreviewOrderCreated {
  id: string
  subtotal: number
  currency: string
  photoCount: number
  method: PaymentMethod
}

export interface IPreviewOrderCreated {
  id: string
  subtotal: number
  currency: string
  photoCount: number
  method: PaymentMethod
}
