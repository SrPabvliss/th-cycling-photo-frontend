export interface IPaymentIntent {
  provider: string
  payload: Record<string, unknown>
}

export interface IPaymentDelivery {
  orderId: string
  eventName: string
  token: string
}

export interface IPaymentResult {
  approved: boolean
  /** An approved charge whose orders could not be settled: money taken with nothing handed over. */
  settled: boolean
  orderIds: string[]
  message: string | null
  deliveries: IPaymentDelivery[]
}

export interface IPaymentTransaction {
  clientTransactionId: string
  status: string
  amountCents: number
  orderIds: string[]
  failureMessage: string | null
  deliveries: IPaymentDelivery[]
}
