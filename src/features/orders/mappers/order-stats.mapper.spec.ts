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
}

describe('toOrderStats', () => {
  it('converts totalRevenue string to a number', () => {
    expect(toOrderStats(api).totalRevenue).toBe(1234.5)
  })

  it('maps count fields verbatim', () => {
    const result = toOrderStats(api)
    expect(result.paidCount).toBe(3)
    expect(result.totalOrders).toBe(10)
  })
})
