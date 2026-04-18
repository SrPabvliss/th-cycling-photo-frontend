import { API_ROUTES } from '@/core/api/api-routes'

export const ORDER_QUERY_KEYS = {
  all: () => [API_ROUTES.ORDERS.BASE] as const,
  list: (filters: { page?: number; status?: string; eventId?: string; search?: string }) =>
    [API_ROUTES.ORDERS.BASE, 'list', filters] as const,
  detail: (id: string) => [API_ROUTES.ORDERS.BASE, 'detail', id] as const,
  stats: () => [API_ROUTES.ORDERS.BASE, 'stats'] as const,
} as const
