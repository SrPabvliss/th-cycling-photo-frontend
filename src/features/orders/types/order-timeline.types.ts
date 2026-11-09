import type { OrderStatus } from './responses/order-list.response'

export interface IOrderTimelineFacts {
  status: OrderStatus
  createdAt: Date
  notifiedAt: Date | null
  paidAt: Date | null
  deliveredAt: Date | null
  cancelledAt: Date | null
}
