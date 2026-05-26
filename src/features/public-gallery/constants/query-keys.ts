import { API_ROUTES } from '@/core/api/api-routes'

export const PUBLIC_GALLERY_QUERY_KEYS = {
  events: () => [API_ROUTES.PUBLIC_EVENTS.BASE, 'list'] as const,
  eventDetail: (eventId: string) => [API_ROUTES.PUBLIC_EVENTS.BASE, 'detail', eventId] as const,
  photos: (
    eventId: string,
    page?: number,
    categoryId?: number,
    bibNumber?: string,
    bibMatch?: 'exact' | 'starts' | 'contains',
    section?: 'matched' | 'no_bib',
  ) =>
    [
      API_ROUTES.PUBLIC_EVENTS.BASE,
      'photos',
      eventId,
      { page, categoryId, bibNumber, bibMatch, section },
    ] as const,
} as const
