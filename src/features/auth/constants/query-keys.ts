import { API_ROUTES } from '@/core/api/api-routes'

export const AUTH_QUERY_KEYS = {
  me: () => [API_ROUTES.AUTH.BASE, 'me'] as const,
} as const
