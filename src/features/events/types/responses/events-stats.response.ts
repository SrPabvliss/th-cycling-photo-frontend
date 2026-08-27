/** Counts keyed by tab id — see EVENT_TABS */
export interface IApiEventsStatsTabs {
  all: number
  active: number
  no_cover: number
  frozen: number
  archived: number
}

/** API projection from GET /events/stats */
export interface IApiEventsStats {
  totalEvents: number
  activeEvents: number
  visibleEvents: number
  photosOnline: number
  pendingReview: number
  eventsPendingReview: number
  nearOrOverQuota: number
  revenue: string
  orders: number
  unpaidOrders: number
  tabs: IApiEventsStatsTabs
}

export interface IEventsStatsTabs {
  all: number
  active: number
  no_cover: number
  frozen: number
  archived: number
}

/** Frontend domain type. `revenue` stays a decimal string for exact-cents math. */
export interface IEventsStats {
  totalEvents: number
  activeEvents: number
  visibleEvents: number
  photosOnline: number
  pendingReview: number
  eventsPendingReview: number
  nearOrOverQuota: number
  revenue: string
  orders: number
  unpaidOrders: number
  tabs: IEventsStatsTabs
}
