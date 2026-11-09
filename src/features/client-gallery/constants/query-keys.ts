import { API_ROUTES } from '@/core/api/api-routes'

export const CLIENT_GALLERY_QUERY_KEYS = {
  preview: (token: string) => [API_ROUTES.PREVIEW_PUBLIC.BASE, 'preview', token] as const,
} as const
