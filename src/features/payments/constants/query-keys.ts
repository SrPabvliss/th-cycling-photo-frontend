export const PAYMENT_QUERY_KEYS = {
  transaction: (clientTransactionId: string) =>
    ['payment-transaction', clientTransactionId] as const,
} as const
