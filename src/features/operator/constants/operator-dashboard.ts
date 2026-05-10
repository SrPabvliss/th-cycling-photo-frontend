/**
 * Dashboard cache freshness windows for TanStack Query.
 * - VOLATILE: changes frequently (KPI counts, recent activity).
 * - STABLE: rarely changes after the operator gets assigned (event lists).
 */
export const DASHBOARD_STALE_TIME = {
  VOLATILE: 30_000, // 30s
  STABLE: 5 * 60_000, // 5min
} as const

/**
 * Default page sizes for paginated dashboard queries.
 */
export const DASHBOARD_PAGE_SIZE = {
  EVENTS: 20,
  ACTIVITY: 10,
} as const
