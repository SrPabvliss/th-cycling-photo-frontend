import type { DeliveryLinkStatus } from '../types/responses/order-detail.response'
import { ORDER_STATUS, type OrderStatus } from '../types/responses/order-list.response'

export interface IStatusBadgeConfig {
  label: string
  type: 'default' | 'info' | 'warning' | 'success' | 'error'
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, IStatusBadgeConfig> = {
  [ORDER_STATUS.PENDING]: { label: 'Pendiente', type: 'error' },
  [ORDER_STATUS.PAYMENT_INFO_SENT]: { label: 'Info de pago enviada', type: 'warning' },
  [ORDER_STATUS.PAID]: { label: 'Pagado', type: 'info' },
  [ORDER_STATUS.DELIVERED]: { label: 'Entregado', type: 'success' },
  [ORDER_STATUS.CANCELLED]: { label: 'Cancelado', type: 'default' },
}

export const DELIVERY_LINK_STATUS_CONFIG: Record<DeliveryLinkStatus, IStatusBadgeConfig> = {
  active: { label: 'Activo', type: 'success' },
  downloaded: { label: 'Descargado', type: 'info' },
  expired: { label: 'Expirado', type: 'error' },
}

export interface IOrderFilterTab {
  label: string
  status: OrderStatus | null
}

export const ORDER_FILTER_TABS: IOrderFilterTab[] = [
  { label: 'Todos', status: null },
  { label: 'Pendientes', status: ORDER_STATUS.PENDING },
  { label: 'Info enviada', status: ORDER_STATUS.PAYMENT_INFO_SENT },
  { label: 'Pagados', status: ORDER_STATUS.PAID },
  { label: 'Entregados', status: ORDER_STATUS.DELIVERED },
  { label: 'Cancelados', status: ORDER_STATUS.CANCELLED },
]
