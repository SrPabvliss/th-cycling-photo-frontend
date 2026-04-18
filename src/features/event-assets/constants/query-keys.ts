import { API_ROUTES } from '@/core/api/api-routes'

export const EVENT_ASSET_QUERY_KEYS = {
  byEvent: (eventId: string) => [API_ROUTES.EVENTS.ASSETS.GET_ALL(eventId)] as const,
} as const
