export const ORDER_STATUS = {
  PENDING: 'pending',
  PAYMENT_INFO_SENT: 'payment_info_sent',
  PAID: 'paid',
  DELIVERED: 'delivered',
  GIFTED: 'gifted',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]
