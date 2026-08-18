export interface IPaymentIntent {
  provider: string
  payload: Record<string, unknown>
}

export interface IPaymentResult {
  approved: boolean
  orderIds: string[]
  message: string | null
}

export interface IPaymentTransaction {
  clientTransactionId: string
  status: string
  amountCents: number
  orderIds: string[]
  failureMessage: string | null
}
