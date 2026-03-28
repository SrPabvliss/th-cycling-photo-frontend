import type { IApiOrderStats, IOrderStats } from '../types/responses/order-stats.response'

export function toOrderStats(api: IApiOrderStats): IOrderStats {
  return {
    totalOrders: api.totalOrders,
    pendingCount: api.pendingCount,
    paidCount: api.paidCount,
    deliveredCount: api.deliveredCount,
    cancelledCount: api.cancelledCount,
  }
}
