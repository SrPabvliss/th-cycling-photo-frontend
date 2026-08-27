import { API_ROUTES } from '@/core/api/api-routes'
import type { IEventListItem } from '../types/responses/event-list.response'

export const EVENT_QUERY_KEYS = {
  all: () => [API_ROUTES.EVENTS.BASE] as const,
  list: (page?: number) => [API_ROUTES.EVENTS.BASE, 'list', { page }] as const,
  detail: (id: IEventListItem['id']) => [API_ROUTES.EVENTS.BASE, 'detail', id] as const,
  stats: () => [API_ROUTES.EVENTS.BASE, 'stats'] as const,
  operators: (eventId: string) => [API_ROUTES.EVENTS.BASE, 'operators', eventId] as const,
  configurationPreset: () => [API_ROUTES.EVENTS.BASE, 'configuration-preset'] as const,
  configuration: (eventId: string) => [API_ROUTES.EVENTS.BASE, 'configuration', eventId] as const,
  creationContext: () => [API_ROUTES.EVENTS.BASE, 'creation-context'] as const,
} as const
