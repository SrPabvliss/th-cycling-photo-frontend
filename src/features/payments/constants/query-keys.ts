export const PAYMENT_QUERY_KEYS = {
  paymentAccount: () => ['payment-account'] as const,
  transaction: (clientTransactionId: string) =>
    ['payment-transaction', clientTransactionId] as const,
} as const
