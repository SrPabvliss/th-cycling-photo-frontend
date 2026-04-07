import { API_ROUTES } from '@/core/api/api-routes'

export const OPERATOR_QUERY_KEYS = {
  all: () => [API_ROUTES.OPERATOR.BASE] as const,
  dashboard: () => [API_ROUTES.OPERATOR.BASE, 'dashboard'] as const,
  retouchQueue: (eventId: string) => [API_ROUTES.OPERATOR.BASE, 'retouch-queue', eventId] as const,
} as const
