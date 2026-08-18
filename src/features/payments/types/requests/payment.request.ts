import type { IPaymentCredentials, PaymentMode } from '../payment-account'

export interface IConfirmPaymentRequest {
  clientTransactionId: string
  id: number
}

export type IConfigurePaymentAccountRequest = { mode: PaymentMode } & IPaymentCredentials
