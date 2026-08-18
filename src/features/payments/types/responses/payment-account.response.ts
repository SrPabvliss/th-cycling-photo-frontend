import type { PaymentAccountStatus, PaymentMode } from '../payment-account'

export interface IApiPaymentAccount {
  provider: string
  mode: PaymentMode
  status: PaymentAccountStatus
  phone: string | null
  storeId: string | null
  verifiedAt: string | null
  isUsable: boolean
}
