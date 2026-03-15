import { API_ROUTES } from '@/core/api/api-routes'

export const CLASSIFICATION_QUERY_KEYS = {
  all: () => [API_ROUTES.CLASSIFICATIONS.BASE] as const,
  cyclistsByPhoto: (photoId: string) =>
    [API_ROUTES.CLASSIFICATIONS.BASE, 'by-photo', photoId] as const,
  cyclistDetail: (id: string) => [API_ROUTES.CLASSIFICATIONS.BASE, 'detail', id] as const,
  workspacePhotos: (eventId: string, page: number, classified?: boolean) =>
    [API_ROUTES.CLASSIFICATIONS.BASE, 'workspace-photos', eventId, { page, classified }] as const,
  similarPhotos: (photoId: string) =>
    [API_ROUTES.CLASSIFICATIONS.BASE, 'similar', photoId] as const,
} as const
