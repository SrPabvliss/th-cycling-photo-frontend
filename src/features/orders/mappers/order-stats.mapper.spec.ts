import { describe, it, expect } from 'vitest'
import { toOrderStats } from './order-stats.mapper'
import type { IApiOrderStats } from '../types/responses/order-stats.response'

const api: IApiOrderStats = {
  totalOrders: 10,
  activeOrders: 9,
  pendingCount: 1,
  paymentInfoSentCount: 2,
  paidCount: 3,
  deliveredCount: 4,
  giftedCount: 0,
  cancelledCount: 1,
  totalRevenue: '1234.50',
  openCount: 3,
  openAmount: '567.25',
  awaitingDeliveryCount: 2,
  tabs: {
    all: 10,
    pending: 1,
    payment_info_sent: 2,
    paid: 3,
    delivered: 4,
    gifted: 0,
    cancelled: 1,
  },
}

describe('toOrderStats', () => {
  it('parses totalRevenue string to number and keeps openAmount as string', () => {
    const result = toOrderStats(api)
    expect(result.totalRevenue).toBe(1234.5)
    expect(result.openAmount).toBe('567.25')
    expect(typeof result.openAmount).toBe('string')
  })
})
