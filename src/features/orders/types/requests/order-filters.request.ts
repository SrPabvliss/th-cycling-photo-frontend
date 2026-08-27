import { ORDER_STATUS, type OrderStatus } from '@/shared/types/order-status.types'

export const ORDER_TABS = [
  'all',
  'pending',
  'paymentInfoSent',
  'paid',
  'delivered',
  'gifted',
  'cancelled',
] as const

export type OrderTab = (typeof ORDER_TABS)[number]

export const ORDER_TAB_STATUS: Record<OrderTab, OrderStatus | undefined> = {
  all: undefined,
  pending: ORDER_STATUS.PENDING,
  paymentInfoSent: ORDER_STATUS.PAYMENT_INFO_SENT,
  paid: ORDER_STATUS.PAID,
  delivered: ORDER_STATUS.DELIVERED,
  gifted: ORDER_STATUS.GIFTED,
  cancelled: ORDER_STATUS.CANCELLED,
}

export interface IOrderFilters {
  search: string | null
  eventId: string | null
  tab: OrderTab
}

export function toOrderFiltersParams(filters: IOrderFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {}
  const status = ORDER_TAB_STATUS[filters.tab]

  if (status) params.status = status
  if (filters.eventId) params.eventId = filters.eventId
  if (filters.search) params.search = filters.search

  return params
}
