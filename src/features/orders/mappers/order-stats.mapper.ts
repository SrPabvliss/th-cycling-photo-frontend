import type { IApiOrderStats, IOrderStats } from '../types/responses/order-stats.response'

export function toOrderStats(api: IApiOrderStats): IOrderStats {
  return {
    totalOrders: api.totalOrders,
    activeOrders: api.activeOrders,
    pendingCount: api.pendingCount,
    paymentInfoSentCount: api.paymentInfoSentCount,
    paidCount: api.paidCount,
    deliveredCount: api.deliveredCount,
    giftedCount: api.giftedCount,
    cancelledCount: api.cancelledCount,
  }
}
