export const PAYMENT_MODE = {
  OWN_MERCHANT: 'own_merchant',
  SPLIT_RECEIVER: 'split_receiver',
} as const

export type PaymentMode = (typeof PAYMENT_MODE)[keyof typeof PAYMENT_MODE]

export const PAYMENT_ACCOUNT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  DISABLED: 'disabled',
} as const

export type PaymentAccountStatus =
  (typeof PAYMENT_ACCOUNT_STATUS)[keyof typeof PAYMENT_ACCOUNT_STATUS]

export type IPaymentCredentials = Record<string, string | undefined>

export interface IPaymentAccount {
  provider: string
  mode: PaymentMode
  status: PaymentAccountStatus
  phone: string | null
  storeId: string | null
  verifiedAt: Date | null
  isUsable: boolean
}
