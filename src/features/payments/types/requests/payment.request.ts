import type { PaymentMethod } from '../payment-method'

export interface IConfirmPaymentRequest {
  clientTransactionId: string
  id: number
}

export interface IChoosePaymentMethodRequest {
  orderIds: string[]
  method: PaymentMethod
}
