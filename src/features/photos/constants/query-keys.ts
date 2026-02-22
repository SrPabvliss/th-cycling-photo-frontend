import { API_ROUTES } from '@/core/api/api-routes'

export const PHOTO_QUERY_KEYS = {
  all: () => [API_ROUTES.PHOTOS.BASE] as const,
  listByEvent: (eventId: string, page?: number, status?: string | null) =>
    [API_ROUTES.PHOTOS.BASE, 'list', eventId, { page, status }] as const,
  detail: (id: string) => [API_ROUTES.PHOTOS.BASE, 'detail', id] as const,
} as const
