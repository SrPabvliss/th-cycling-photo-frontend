import { API_ROUTES } from '@/core/api/api-routes'

export const PRICING_QUERY_KEYS = {
  all: () => [API_ROUTES.PRICING.BASE] as const,
  preview: (photoCount: number) => [API_ROUTES.PRICING.BASE, 'preview', photoCount] as const,
  tiers: () => [API_ROUTES.PRICING.BASE, 'tiers'] as const,
} as const
