import { API_ROUTES } from '@/core/api/api-routes'

export const CONTRACT_QUERY_KEYS = {
  all: () => [API_ROUTES.CONTRACTS.BASE] as const,
  byToken: (token: string) => [API_ROUTES.CONTRACTS.BASE, 'token', token] as const,
  mine: () => [API_ROUTES.CONTRACTS.BASE, 'mine'] as const,
} as const
