import { getNavLinks } from './nav-config'
import { PERMISSIONS } from './permissions'

export function canShop(permissions: string[]): boolean {
  return permissions.includes(PERMISSIONS.CART_CHECKOUT)
}

export function canSeeNotifications(permissions: string[]): boolean {
  return permissions.includes(PERMISSIONS.NOTIFICATION_READ)
}

export function canOperate(permissions: string[]): boolean {
  return getNavLinks(permissions).length > 0
}
