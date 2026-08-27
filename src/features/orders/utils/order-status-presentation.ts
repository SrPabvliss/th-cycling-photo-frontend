import { ORDER_STATUS, type OrderStatus } from '../types/responses/order-list.response'

export type OrderStatusTone = 'pend' | 'info' | 'paid' | 'deli' | 'gift' | 'canc'

export interface IOrderStatusPresentation {
  label: string
  tone: OrderStatusTone
  soft: boolean
  suffix: string | null
}

interface IStatusBase {
  label: string
  tone: OrderStatusTone
  solid: boolean
}

const STATUS_BASE: Record<OrderStatus, IStatusBase> = {
  [ORDER_STATUS.PENDING]: { label: 'Pendiente', tone: 'pend', solid: true },
  [ORDER_STATUS.PAYMENT_INFO_SENT]: { label: 'Info de pago enviada', tone: 'info', solid: true },
  [ORDER_STATUS.PAID]: { label: 'Pagado', tone: 'paid', solid: true },
  [ORDER_STATUS.DELIVERED]: { label: 'Entregado', tone: 'deli', solid: false },
  [ORDER_STATUS.GIFTED]: { label: 'Regalada', tone: 'gift', solid: true },
  [ORDER_STATUS.CANCELLED]: { label: 'Cancelado', tone: 'canc', solid: false },
}

interface IOrderStatusFacts {
  status: OrderStatus
  deliveredAt: Date | null
}

export function getOrderStatusPresentation(order: IOrderStatusFacts): IOrderStatusPresentation {
  const base = STATUS_BASE[order.status]
  const isDelivered = order.deliveredAt !== null
  const isGifted = order.status === ORDER_STATUS.GIFTED
  const soft = !base.solid || (isGifted && isDelivered)
  const suffix = isGifted ? (isDelivered ? '· entregada' : '· por entregar') : null

  return { label: base.label, tone: base.tone, soft, suffix }
}
