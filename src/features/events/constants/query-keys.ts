import { API_ROUTES } from '@/core/api/api-routes'
import type { IEventListItem } from '../types/responses/event-list.response'

export const EVENT_QUERY_KEYS = {
  all: () => [API_ROUTES.EVENTS.BASE] as const,
  list: (page?: number) => [API_ROUTES.EVENTS.BASE, 'list', { page }] as const,
  detail: (id: IEventListItem['id']) => [API_ROUTES.EVENTS.BASE, 'detail', id] as const,
} as const
