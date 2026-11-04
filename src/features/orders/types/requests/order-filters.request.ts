import { ORDER_STATUS, type OrderStatus } from '../responses/order-list.response'

export const ORDER_TABS = [
  'all',
  'pending',
  'payment_info_sent',
  'paid',
  'delivered',
  'gifted',
  'cancelled',
] as const

export type OrderTab = (typeof ORDER_TABS)[number]

export const ORDER_TAB_STATUS: Record<OrderTab, OrderStatus | undefined> = {
  all: undefined,
  pending: ORDER_STATUS.PENDING,
  payment_info_sent: ORDER_STATUS.PAYMENT_INFO_SENT,
  paid: ORDER_STATUS.PAID,
  delivered: ORDER_STATUS.DELIVERED,
  gifted: ORDER_STATUS.GIFTED,
  cancelled: ORDER_STATUS.CANCELLED,
}

export const ORDER_INVOICE_FILTERS = [
  'none',
  'in_process',
  'authorized',
  'rejected',
  'annulled',
] as const

export type OrderInvoiceFilter = (typeof ORDER_INVOICE_FILTERS)[number]

export const ORDER_INVOICE_FILTER_LABELS: Record<OrderInvoiceFilter, string> = {
  none: 'Sin factura',
  in_process: 'En proceso',
  authorized: 'Autorizada',
  rejected: 'Rechazada',
  annulled: 'Anulada',
}

export interface IOrderFilters {
  search: string | null
  eventId: string | null
  tab: OrderTab
  invoiceState: OrderInvoiceFilter | null
}

export function toOrderFiltersParams(filters: IOrderFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {}
  const status = ORDER_TAB_STATUS[filters.tab]

  if (status) params.status = status
  if (filters.eventId) params.eventId = filters.eventId
  if (filters.search) params.search = filters.search
  if (filters.invoiceState) params.invoiceState = filters.invoiceState

  return params
}
