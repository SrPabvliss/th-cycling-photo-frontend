import type {
  IApiEventsStats,
  IApiEventsStatsTabs,
  IEventsStats,
  IEventsStatsTabs,
} from '../types/responses/events-stats.response'

function toEventsStatsTabs(tabs: IApiEventsStatsTabs): IEventsStatsTabs {
  return {
    all: tabs.all,
    active: tabs.active,
    no_cover: tabs.no_cover,
    frozen: tabs.frozen,
    archived: tabs.archived,
  }
}

export function toEventsStats(api: IApiEventsStats): IEventsStats {
  return {
    totalEvents: api.totalEvents,
    activeEvents: api.activeEvents,
    visibleEvents: api.visibleEvents,
    photosOnline: api.photosOnline,
    pendingReview: api.pendingReview,
    eventsPendingReview: api.eventsPendingReview,
    nearOrOverQuota: api.nearOrOverQuota,
    revenue: api.revenue,
    orders: api.orders,
    unpaidOrders: api.unpaidOrders,
    tabs: toEventsStatsTabs(api.tabs),
  }
}
