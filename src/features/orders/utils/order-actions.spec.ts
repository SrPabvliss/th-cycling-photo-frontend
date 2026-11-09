import { describe, expect, it } from 'vitest'

import { PERMISSIONS, type PermissionKey } from '@/core/auth/permissions'
import { ORDER_STATUS } from '../types/responses/order-list.response'
import { resolveOrderActions } from './order-actions'

const TENANT: PermissionKey[] = [
  PERMISSIONS.ORDER_NOTIFY_PAYMENT,
  PERMISSIONS.ORDER_CONFIRM_PAYMENT,
  PERMISSIONS.ORDER_DELIVER,
  PERMISSIONS.ORDER_DELIVERY_REGENERATE,
  PERMISSIONS.ORDER_CANCEL,
]
const ADMIN: PermissionKey[] = [
  ...TENANT,
  PERMISSIONS.ORDER_GIFT,
  PERMISSIONS.ORDER_CONVERT_TO_GIFT,
  PERMISSIONS.ORDER_CONVERT_TO_SALE,
]

const can = (held: PermissionKey[]) => (key: PermissionKey) => held.includes(key)
const ids = (
  status: (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS],
  held: PermissionKey[],
  deliveredAt: Date | null = null,
) => resolveOrderActions({ status, deliveredAt }, can(held)).map((action) => action.id)

describe('resolveOrderActions', () => {
  it('offers the admin a switch to gift on a paid order', () => {
    expect(ids(ORDER_STATUS.PAID, ADMIN)).toEqual(['deliver', 'cancel', 'to_gift'])
  })

  it('offers the admin a switch to gift on a delivered order', () => {
    expect(ids(ORDER_STATUS.DELIVERED, ADMIN, new Date())).toEqual(['regenerate', 'to_gift'])
  })

  it('hides the platform-only actions from an organizer', () => {
    expect(ids(ORDER_STATUS.PAID, TENANT)).toEqual(['deliver', 'cancel'])
    expect(ids(ORDER_STATUS.PENDING, TENANT)).toEqual(['notify', 'confirm', 'cancel'])
  })

  it('offers nothing to someone who can only read orders', () => {
    expect(ids(ORDER_STATUS.PENDING, [PERMISSIONS.ORDER_READ])).toEqual([])
  })

  it('labels the switch the same way the confirmation dialog does', () => {
    const toGift = resolveOrderActions(
      { status: ORDER_STATUS.PAID, deliveredAt: null },
      can(ADMIN),
    ).find((action) => action.id === 'to_gift')
    expect(toGift?.label).toBe('Cambiar a regalo')
  })
})
