import { API_ROUTES } from '@/core/api/api-routes'

export const PHOTO_CATEGORY_QUERY_KEYS = {
  byEvent: (eventId: string) => [API_ROUTES.PHOTO_CATEGORIES.BY_EVENT(eventId)] as const,
} as const
