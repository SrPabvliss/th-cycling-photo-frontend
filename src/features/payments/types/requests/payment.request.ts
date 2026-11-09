import type { PaymentMethod } from '@/shared/types/payment-method.types'

export interface IConfirmPaymentRequest {
  clientTransactionId: string
  id: number
}

export interface IChoosePaymentMethodRequest {
  orderIds: string[]
  method: PaymentMethod
}
