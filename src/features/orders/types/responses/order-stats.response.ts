/** API projection from GET /orders/stats */
export interface IApiOrderStats {
  totalOrders: number
  activeOrders: number
  pendingCount: number
  paymentInfoSentCount: number
  paidCount: number
  deliveredCount: number
  giftedCount: number
  cancelledCount: number
  /** Decimal string, e.g. "1234.50" */
  totalRevenue: string
}

/** Frontend domain type (identical — no transformation needed) */
export interface IOrderStats {
  totalOrders: number
  activeOrders: number
  pendingCount: number
  paymentInfoSentCount: number
  paidCount: number
  deliveredCount: number
  giftedCount: number
  cancelledCount: number
  /** Numeric revenue (USD assumed) */
  totalRevenue: number
}
