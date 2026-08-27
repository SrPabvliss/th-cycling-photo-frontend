import type { OrderStatus } from '@/shared/types/order-status.types'

export interface IOrderTimelineFacts {
  status: OrderStatus
  createdAt: Date
  notifiedAt: Date | null
  paidAt: Date | null
  deliveredAt: Date | null
  cancelledAt: Date | null
}
