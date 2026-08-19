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
