import { API_ROUTES } from '@/core/api/api-routes'

export const BUYER_QUERY_KEYS = {
  list: (page?: number, search?: string) => [API_ROUTES.BUYERS.GET_ALL, { page, search }] as const,
} as const
