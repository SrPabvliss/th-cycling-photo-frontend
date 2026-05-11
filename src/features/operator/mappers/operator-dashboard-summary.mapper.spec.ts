import { describe, expect, it } from 'vitest'

import { toDashboardSummary } from './operator-dashboard-summary.mapper'
import type { IApiDashboardSummary } from '../types/responses/operator-dashboard-summary.response'

describe('toDashboardSummary', () => {
  it('copies the three KPI counts from API into domain shape', () => {
    const api: IApiDashboardSummary = {
      pendingReviewCount: 12,
      pendingRetouchCount: 3,
      assignedEventsCount: 2,
    }
    expect(toDashboardSummary(api)).toEqual({
      pendingReviewCount: 12,
      pendingRetouchCount: 3,
      assignedEventsCount: 2,
    })
  })

  it('handles zeroed counts', () => {
    const api: IApiDashboardSummary = {
      pendingReviewCount: 0,
      pendingRetouchCount: 0,
      assignedEventsCount: 0,
    }
    expect(toDashboardSummary(api)).toEqual({
      pendingReviewCount: 0,
      pendingRetouchCount: 0,
      assignedEventsCount: 0,
    })
  })
})
