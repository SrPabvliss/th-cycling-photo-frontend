import { API_ROUTES } from '@/core/api/api-routes'

export const DELIVERY_QUERY_KEYS = {
  delivery: (token: string) => [API_ROUTES.DELIVERY_PUBLIC.BASE, 'delivery', token] as const,
} as const
