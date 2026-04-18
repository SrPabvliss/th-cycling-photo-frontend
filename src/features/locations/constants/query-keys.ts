import { API_ROUTES } from '@/core/api/api-routes'

export const LOCATION_QUERY_KEYS = {
  all: () => [API_ROUTES.LOCATIONS.BASE] as const,
  provinces: () => [API_ROUTES.LOCATIONS.BASE, 'provinces'] as const,
  cantons: (provinceId: number) => [API_ROUTES.LOCATIONS.BASE, 'cantons', provinceId] as const,
} as const
