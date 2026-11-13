import { API_ROUTES } from '@/core/api/api-routes'

export const PUBLIC_GALLERY_QUERY_KEYS = {
  eventDetail: (eventId: string) => [API_ROUTES.PUBLIC_EVENTS.BASE, 'detail', eventId] as const,
  /** `matched` is the main list (everything, or one exact plate); `no_bib` its companion. */
  photos: (
    eventId: string,
    categoryId: number | null,
    plate: string | null,
    section: 'matched' | 'no_bib',
  ) => [API_ROUTES.PUBLIC_EVENTS.BASE, 'photos', eventId, { categoryId, plate, section }] as const,
} as const
