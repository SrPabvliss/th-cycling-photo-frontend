import type { IStatusBadgeConfig } from '@/shared/types/badge-config.types'
import type { DeliveryLinkStatus } from '../types/responses/order-detail.response'
import { ORDER_STATUS, type OrderStatus } from '../types/responses/order-list.response'

export type { IStatusBadgeConfig } from '@/shared/types/badge-config.types'

export const ORDER_STATUS_CONFIG: Record<OrderStatus, IStatusBadgeConfig> = {
  [ORDER_STATUS.PENDING]: { label: 'Pendiente', type: 'error' },
  [ORDER_STATUS.PAYMENT_INFO_SENT]: { label: 'Info de pago enviada', type: 'warning' },
  [ORDER_STATUS.PAID]: { label: 'Pagado', type: 'info' },
  [ORDER_STATUS.DELIVERED]: { label: 'Entregado', type: 'success' },
  [ORDER_STATUS.GIFTED]: { label: 'Regalada', type: 'default', color: '#7c3aed' },
  [ORDER_STATUS.CANCELLED]: { label: 'Cancelado', type: 'default' },
}

export const DELIVERY_LINK_STATUS_CONFIG: Record<DeliveryLinkStatus, IStatusBadgeConfig> = {
  active: { label: 'Activo', type: 'success' },
  downloaded: { label: 'Descargado', type: 'info' },
  expired: { label: 'Expirado', type: 'error' },
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Tarjeta',
  transfer: 'Transferencia',
}
