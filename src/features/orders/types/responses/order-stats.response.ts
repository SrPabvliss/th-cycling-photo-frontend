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
}
