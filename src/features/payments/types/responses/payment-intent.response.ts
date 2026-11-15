export interface IPaymentIntent {
  provider: string
  payload: Record<string, unknown>
}

export interface IPaymentDelivery {
  orderId: string
  eventName: string
  token: string
}

/** Why an approved charge is to be given back: its order no longer took it. */
export type PaymentRefundReason = 'order_paid' | 'order_cancelled' | 'order_gifted'

export interface IPaymentResult {
  approved: boolean
  /** An approved charge whose orders could not be settled: money taken with nothing handed over. */
  settled: boolean
  orderIds: string[]
  message: string | null
  deliveries: IPaymentDelivery[]
  /**
   * Set on every confirmation of a charge approved for an order that no longer took it (paid
   * another way, cancelled, or made free): Titan TV refunds it. Null, or missing, otherwise.
   */
  refund?: { reason: PaymentRefundReason } | null
}

export interface IPaymentTransaction {
  clientTransactionId: string
  status: string
  amountCents: number
  orderIds: string[]
  failureMessage: string | null
  deliveries: IPaymentDelivery[]
}
