import { API_ROUTES } from '@/core/api/api-routes'

export const PHOTO_CATEGORY_QUERY_KEYS = {
  byEvent: (eventId: string) => [API_ROUTES.PHOTO_CATEGORIES.BY_EVENT(eventId)] as const,
  /** Every catalog variant, for invalidation after creating a category. */
  catalogAll: () => [API_ROUTES.PHOTO_CATEGORIES.GET_ALL, 'catalog'] as const,
  /** Base + own categories of the event's organizer, or of the user's tenant without an event. */
  catalog: (eventId: string | null) =>
    [API_ROUTES.PHOTO_CATEGORIES.GET_ALL, 'catalog', eventId ?? 'mine'] as const,
} as const
