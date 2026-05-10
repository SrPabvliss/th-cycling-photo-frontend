import type {
  IApiDashboardSummary,
  IDashboardSummary,
} from '../types/responses/operator-dashboard-summary.response'

export function toDashboardSummary(api: IApiDashboardSummary): IDashboardSummary {
  return {
    pendingReviewCount: api.pendingReviewCount,
    pendingRetouchCount: api.pendingRetouchCount,
    assignedEventsCount: api.assignedEventsCount,
  }
}
