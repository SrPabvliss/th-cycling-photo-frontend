import { API_ROUTES } from '@/core/api/api-routes'

export const PARTICIPANT_CATEGORY_QUERY_KEYS = {
  all: () => [API_ROUTES.PARTICIPANT_CATEGORIES.GET_ALL] as const,
  byEventType: (eventTypeId: number) =>
    [API_ROUTES.PARTICIPANT_CATEGORIES.GET_ALL, 'by-event-type', eventTypeId] as const,
} as const
