import { API_ROUTES } from '@/core/api/api-routes'

export const CART_QUERY_KEYS = {
  cart: () => [API_ROUTES.CART.GET] as const,
} as const
