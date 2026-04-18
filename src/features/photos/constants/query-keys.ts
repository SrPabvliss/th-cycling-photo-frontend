import { API_ROUTES } from '@/core/api/api-routes'

export const PHOTO_QUERY_KEYS = {
  all: () => [API_ROUTES.PHOTOS.BASE] as const,
  listByEvent: (eventId: string, page?: number, status?: string | null, limit?: number) =>
    [API_ROUTES.PHOTOS.BASE, 'list', eventId, { page, status, limit }] as const,
  detail: (id: string) => [API_ROUTES.PHOTOS.BASE, 'detail', id] as const,
  presignedUrl: (eventId: string, fileName: string) =>
    [API_ROUTES.PHOTOS.BASE, 'presigned-url', eventId, fileName] as const,
  downloadUrl: (id: string, type: string) =>
    [API_ROUTES.PHOTOS.BASE, 'download', id, type] as const,
  search: (filters: Record<string, unknown>) =>
    [API_ROUTES.PHOTOS.BASE, 'search', filters] as const,
} as const
