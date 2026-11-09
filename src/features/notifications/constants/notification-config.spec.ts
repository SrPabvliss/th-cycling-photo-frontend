import { describe, it, expect } from 'vitest'

import { PERMISSIONS } from '@/core/auth/permissions'
import { NOTIFICATION_CONFIG } from './notification-config'
import { NOTIFICATION_TYPE } from '../types/notification.types'

const READER = [PERMISSIONS.ORDER_READ]

describe('NOTIFICATION_CONFIG order routes', () => {
  const orderTypes = [
    NOTIFICATION_TYPE.ORDER_CREATED,
    NOTIFICATION_TYPE.ORDER_PAID,
    NOTIFICATION_TYPE.ORDER_DELIVERED,
    NOTIFICATION_TYPE.ORDER_RETOUCH_COMPLETED,
  ]

  for (const type of orderTypes) {
    it(`opens the order from the list for ${type}, because /orders/:id is not a route`, () => {
      const route = NOTIFICATION_CONFIG[type].getRoute({ orderId: 'order-1' }, READER)

      expect(route).toBe('/orders?order=order-1')
    })
  }

  it('sends a retoucher without order access to the operator board', () => {
    const route = NOTIFICATION_CONFIG[NOTIFICATION_TYPE.ORDER_PAID].getRoute({ orderId: 'o1' }, [
      PERMISSIONS.PHOTO_RETOUCH_READ,
    ])

    expect(route).toBe('/operator')
  })

  it('returns null when the notification carries no order id', () => {
    const route = NOTIFICATION_CONFIG[NOTIFICATION_TYPE.ORDER_CREATED].getRoute({}, READER)

    expect(route).toBeNull()
  })
})
