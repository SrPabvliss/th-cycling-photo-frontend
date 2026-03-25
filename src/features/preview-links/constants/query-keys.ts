import { API_ROUTES } from '@/core/api/api-routes'

export const PREVIEW_LINK_QUERY_KEYS = {
  all: () => [API_ROUTES.PREVIEW_LINKS.BASE] as const,
  byEvent: (eventId: string, page?: number) =>
    [API_ROUTES.PREVIEW_LINKS.BASE, 'by-event', eventId, { page }] as const,
} as const
