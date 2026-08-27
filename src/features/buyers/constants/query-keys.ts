import { API_ROUTES } from '@/core/api/api-routes'
import type { IBuyerFilters } from '../types/requests/buyer-filters.request'

export const BUYER_QUERY_KEYS = {
  all: () => [API_ROUTES.BUYERS.BASE] as const,
  list: (filters: IBuyerFilters) => [API_ROUTES.BUYERS.GET_ALL, 'list', filters] as const,
  stats: (filters: IBuyerFilters) => [API_ROUTES.BUYERS.STATS, filters] as const,
  detail: (id: string) => [API_ROUTES.BUYERS.BASE, 'detail', id] as const,
} as const
