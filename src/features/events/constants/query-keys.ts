import { API_ROUTES } from '@/core/api/api-routes'
import type { IEventFilters } from '../types/requests/event-filters.request'
import type { IEventListItem } from '../types/responses/event-list.response'

export const EVENT_QUERY_KEYS = {
  all: () => [API_ROUTES.EVENTS.BASE] as const,
  list: (filters: IEventFilters) => [API_ROUTES.EVENTS.BASE, 'list', filters] as const,
  detail: (id: IEventListItem['id']) => [API_ROUTES.EVENTS.BASE, 'detail', id] as const,
  stats: (filters: IEventFilters) => [API_ROUTES.EVENTS.BASE, 'stats', filters] as const,
  configurationPreset: () => [API_ROUTES.EVENTS.BASE, 'configuration-preset'] as const,
  configuration: (eventId: string) => [API_ROUTES.EVENTS.BASE, 'configuration', eventId] as const,
  creationContext: () => [API_ROUTES.EVENTS.BASE, 'creation-context'] as const,
} as const
