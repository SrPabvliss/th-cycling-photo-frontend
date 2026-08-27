export const PAYMENT_METHOD = {
  CARD: 'card',
  TRANSFER: 'transfer',
} as const

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]
