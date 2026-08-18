export interface IPayphonePaymentOutcome {
  transactionId: number
  clientTransactionId: string
}

export interface IPayphoneBoxInstance {
  render: (containerId: string) => void
  startProcessPaymentAsync?: () => Promise<IPayphonePaymentOutcome>
  destroy?: () => void
}

export type PayphoneBoxConstructor = new (params: Record<string, unknown>) => IPayphoneBoxInstance
