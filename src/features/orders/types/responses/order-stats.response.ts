/** The seven tab counts partitioning the same in-scope, non-draft population */
export interface IApiOrderStatsTabs {
  all: number
  pending: number
  paymentInfoSent: number
  paid: number
  delivered: number
  gifted: number
  cancelled: number
}

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
  openCount: number
  /** Decimal string, sum of subtotal across pending + payment_info_sent orders */
  openAmount: string
  awaitingDeliveryCount: number
  tabs: IApiOrderStatsTabs
}

export interface IOrderStatsTabs {
  all: number
  pending: number
  paymentInfoSent: number
  paid: number
  delivered: number
  gifted: number
  cancelled: number
}

/** Frontend domain type */
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
  openCount: number
  /** Decimal string, never parsed to a float — kept for exact-cents summation */
  openAmount: string
  awaitingDeliveryCount: number
  tabs: IOrderStatsTabs
}
