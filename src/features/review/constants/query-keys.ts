import { API_ROUTES } from '@/core/api/api-routes'

export const REVIEW_QUERY_KEYS = {
  all: () => [API_ROUTES.EVENTS.BASE, 'review'] as const,
  queue: (eventSlug: string, onlyPending: boolean) =>
    [API_ROUTES.EVENTS.BASE, 'review', 'queue', eventSlug, { onlyPending }] as const,
} as const
