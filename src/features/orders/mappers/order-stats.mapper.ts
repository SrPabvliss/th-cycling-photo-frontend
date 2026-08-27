import type {
  IApiOrderStats,
  IApiOrderStatsTabs,
  IOrderStats,
  IOrderStatsTabs,
} from '../types/responses/order-stats.response'

function toOrderStatsTabs(tabs: IApiOrderStatsTabs): IOrderStatsTabs {
  return {
    all: tabs.all,
    pending: tabs.pending,
    paymentInfoSent: tabs.paymentInfoSent,
    paid: tabs.paid,
    delivered: tabs.delivered,
    gifted: tabs.gifted,
    cancelled: tabs.cancelled,
  }
}

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
    totalRevenue: Number(api.totalRevenue),
    openCount: api.openCount,
    openAmount: api.openAmount,
    awaitingDeliveryCount: api.awaitingDeliveryCount,
    tabs: toOrderStatsTabs(api.tabs),
  }
}
