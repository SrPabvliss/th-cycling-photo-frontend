import type { IPaymentCredentials, PaymentMode } from '../payment-account'
import type { PaymentMethod } from '../payment-method'

export interface IConfirmPaymentRequest {
  clientTransactionId: string
  id: number
}

export type IConfigurePaymentAccountRequest = { mode: PaymentMode } & IPaymentCredentials

export interface IChoosePaymentMethodRequest {
  orderIds: string[]
  method: PaymentMethod
}
