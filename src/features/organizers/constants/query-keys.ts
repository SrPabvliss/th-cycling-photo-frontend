import { API_ROUTES } from '@/core/api/api-routes'
import type { IOrganizerFilters } from '../types/requests/organizer-filters.request'

export const ORGANIZER_QUERY_KEYS = {
  all: () => [API_ROUTES.ORGANIZERS.BASE] as const,
  list: (filters: IOrganizerFilters) => [API_ROUTES.ORGANIZERS.BASE, 'list', filters] as const,
  stats: (filters: IOrganizerFilters) => [API_ROUTES.ORGANIZERS.BASE, 'stats', filters] as const,
  detail: (id: string) => [API_ROUTES.ORGANIZERS.BASE, 'detail', id] as const,
  events: (id: string, page: number) => [API_ROUTES.ORGANIZERS.BASE, 'events', id, page] as const,
} as const
