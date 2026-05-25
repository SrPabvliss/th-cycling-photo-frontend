import { API_ROUTES } from '@/core/api/api-routes'
import type { TRetouchOrderScope } from '../types/responses/operator-retouch-orders.response'

export const RETOUCH_QUERY_KEYS = {
  eventOrders: (eventId: string, scope: TRetouchOrderScope) =>
    [API_ROUTES.OPERATOR.BASE, 'retouch-queue', eventId, scope] as const,
  operatorOrders: (limit: number, scope: TRetouchOrderScope, eventSlug: string | null) =>
    [API_ROUTES.OPERATOR.BASE, 'retouch', 'orders', { limit, scope, eventSlug }] as const,
  orderDetail: (orderId: string) =>
    [API_ROUTES.OPERATOR.BASE, 'retouch', 'order', orderId] as const,
  baseAll: () => [API_ROUTES.OPERATOR.BASE, 'retouch'] as const,
} as const
