import { API_ROUTES } from '@/core/api/api-routes'

export const EVENT_TYPE_QUERY_KEYS = {
  all: () => [API_ROUTES.EVENT_TYPES.GET_ALL] as const,
} as const
