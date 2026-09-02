import { describe, expect, it } from 'vitest'

import { PERMISSIONS } from './permissions'
import { canOperate, canSeeNotifications, canShop } from './capabilities'

const BUYER = [PERMISSIONS.CART_CHECKOUT]
const TENANT = [PERMISSIONS.EVENT_READ, PERMISSIONS.ORDER_READ, PERMISSIONS.CART_CHECKOUT]

describe('capabilities', () => {
  it('lets a buyer shop but not operate', () => {
    expect(canShop(BUYER)).toBe(true)
    expect(canOperate(BUYER)).toBe(false)
  })

  it('lets a tenant do both', () => {
    expect(canShop(TENANT)).toBe(true)
    expect(canOperate(TENANT)).toBe(true)
  })

  it('gives an anonymous permission list neither', () => {
    expect(canShop([])).toBe(false)
    expect(canOperate([])).toBe(false)
  })
})

describe('canSeeNotifications', () => {
  it('allows an account holding notification.read', () => {
    expect(canSeeNotifications([PERMISSIONS.NOTIFICATION_READ])).toBe(true)
  })

  it('denies a buyer account, which never receives notifications', () => {
    expect(canSeeNotifications(BUYER)).toBe(false)
  })
})
