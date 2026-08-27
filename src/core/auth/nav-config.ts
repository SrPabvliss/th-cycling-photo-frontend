import { BUYERS_PATH } from '@/features/buyers/routes'
import { EVENTS_PATH } from '@/features/events/routes'
import { LANDING_PATH } from '@/features/landing/routes'
import { ORDERS_PATH } from '@/features/orders/routes'
import { ORGANIZERS_PATH } from '@/features/organizers/routes'
import { RETOUCH_PATH } from '@/features/retouch/routes'
import { PERMISSIONS, type PermissionKey } from './permissions'
import type { Hat } from './stores/hat.store'

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
  { label: 'Organizadores', to: ORGANIZERS_PATH, permission: PERMISSIONS.TENANT_READ },
  { label: 'Mi perfil', to: '/mi-perfil', permission: PERMISSIONS.TENANT_PROFILE_READ },
]

export function getNavLinks(permissions: string[]): INavLink[] {
  return NAV_ITEMS.filter((item) => permissions.includes(item.permission)).map(
    ({ label, to, disabled }) => ({ label, to, disabled }),
  )
}

export function getHomePath(permissions: string[]): string {
  return getNavLinks(permissions)[0]?.to ?? LANDING_PATH
}

export function getPrincipalLabel(hat: Hat, isPlatform: boolean): string {
  if (isPlatform) return 'TitanTV'
  return hat === 'operating' ? 'Organizador' : 'Cliente'
}
