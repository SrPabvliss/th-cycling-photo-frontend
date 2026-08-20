import { API_ROUTES } from '@/core/api/api-routes'

export const ACCOUNT_QUERY_KEYS = {
  profile: () => [API_ROUTES.MY_PROFILE.BASE] as const,
  phones: () => [API_ROUTES.USER_PHONES.BASE] as const,
} as const
