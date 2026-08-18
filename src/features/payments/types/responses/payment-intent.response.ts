export interface IPaymentIntent {
  provider: string
  payload: Record<string, unknown>
}

export interface IPaymentResult {
  approved: boolean
  orderId: string
  message: string | null
}
