import { API_ROUTES } from '@/core/api/api-routes'

export const NOTIFICATION_QUERY_KEYS = {
  all: () => [API_ROUTES.NOTIFICATIONS.BASE] as const,
  list: () => [API_ROUTES.NOTIFICATIONS.BASE, 'list'] as const,
  unreadCount: () => [API_ROUTES.NOTIFICATIONS.BASE, 'unread-count'] as const,
} as const
