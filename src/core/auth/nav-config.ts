import { BUYERS_PATH } from '@/features/buyers/routes'
import { EVENTS_PATH } from '@/features/events/routes'
import { LANDING_PATH } from '@/features/landing/routes'
import { ORDERS_PATH } from '@/features/orders/routes'
import { RETOUCH_PATH } from '@/features/retouch/routes'
import { PERMISSIONS, type PermissionKey } from './permissions'

export interface INavLink {
  label: string
  to?: string
  disabled?: boolean
}

interface INavItem extends INavLink {
  permission: PermissionKey
}

const NAV_ITEMS: INavItem[] = [
  { label: 'Eventos', to: EVENTS_PATH, permission: PERMISSIONS.EVENT_READ },
  { label: 'Pedidos', to: ORDERS_PATH, permission: PERMISSIONS.ORDER_READ },
  { label: 'Retoque', to: RETOUCH_PATH, permission: PERMISSIONS.PHOTO_RETOUCH_READ },
  { label: 'Compradores', to: BUYERS_PATH, permission: PERMISSIONS.BUYER_READ },
  { label: 'Tenants', to: '/tenants', permission: PERMISSIONS.TENANT_READ },
]

export function getNavLinks(permissions: string[]): INavLink[] {
  return NAV_ITEMS.filter((item) => permissions.includes(item.permission)).map(
    ({ label, to, disabled }) => ({ label, to, disabled }),
  )
}

export function getHomePath(permissions: string[]): string {
  return getNavLinks(permissions)[0]?.to ?? LANDING_PATH
}

export function getPrincipalLabel(
  user: { isPlatform: boolean; tenantId: string | null } | null,
): string {
  if (!user) return 'Cliente'
  if (user.isPlatform) return 'TitanTV'
  return user.tenantId ? 'Organizador' : 'Cliente'
}
