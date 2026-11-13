import { API_ROUTES } from '@/core/api/api-routes'
import { PRICING_TIERS_QUERY_KEY } from '@/shared/pricing/use-pricing-tiers'

export const PRICING_QUERY_KEYS = {
  all: () => [API_ROUTES.PRICING.BASE] as const,
  preview: (photoCount: number) => [API_ROUTES.PRICING.BASE, 'preview', photoCount] as const,
  tiers: () => PRICING_TIERS_QUERY_KEY,
} as const
