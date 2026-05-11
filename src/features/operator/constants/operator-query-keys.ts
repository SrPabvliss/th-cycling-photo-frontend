import { API_ROUTES } from '@/core/api/api-routes'
import type { TReviewQueueStatusFilter } from '../types/review-queue-status-filter'

export const OPERATOR_QUERY_KEYS = {
  all: () => [API_ROUTES.OPERATOR.BASE] as const,
  dashboardSummary: () => [API_ROUTES.OPERATOR.BASE, 'dashboard', 'summary'] as const,
  dashboardActiveEvents: (page: number, limit: number) =>
    [API_ROUTES.OPERATOR.BASE, 'dashboard', 'events', 'active', { page, limit }] as const,
  dashboardCompletedEvents: (page: number, limit: number) =>
    [API_ROUTES.OPERATOR.BASE, 'dashboard', 'events', 'completed', { page, limit }] as const,
  dashboardRecentActivity: (page: number, limit: number) =>
    [API_ROUTES.OPERATOR.BASE, 'dashboard', 'recent-activity', { page, limit }] as const,
  dashboardReviewQueue: (
    eventSlug: string | null,
    status: TReviewQueueStatusFilter,
    limit: number,
  ) =>
    [API_ROUTES.OPERATOR.BASE, 'dashboard', 'review-queue', { eventSlug, status, limit }] as const,
  retouchQueue: (eventId: string) => [API_ROUTES.OPERATOR.BASE, 'retouch-queue', eventId] as const,
} as const
