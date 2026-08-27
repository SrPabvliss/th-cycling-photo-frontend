import { ROUTE_PATHS } from '@/core/navigation/route-paths'
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

// Retouch is hidden on purpose: 1 photo retouched out of 10,994 in production.
const NAV_ITEMS: INavItem[] = [
  { label: 'Eventos', to: ROUTE_PATHS.EVENTS, permission: PERMISSIONS.EVENT_READ },
  { label: 'Pedidos', to: ROUTE_PATHS.ORDERS, permission: PERMISSIONS.ORDER_READ },
  { label: 'Compradores', to: ROUTE_PATHS.BUYERS, permission: PERMISSIONS.BUYER_READ },
  { label: 'Organizadores', to: ROUTE_PATHS.ORGANIZERS, permission: PERMISSIONS.TENANT_READ },
  {
    label: 'Perfil',
    to: ROUTE_PATHS.BUSINESS_PROFILE,
    permission: PERMISSIONS.TENANT_PROFILE_READ,
  },
]

export function getNavLinks(permissions: string[]): INavLink[] {
  return NAV_ITEMS.filter((item) => permissions.includes(item.permission)).map(
    ({ label, to, disabled }) => ({ label, to, disabled }),
  )
}

export function getHomePath(permissions: string[]): string {
  return getNavLinks(permissions)[0]?.to ?? ROUTE_PATHS.LANDING
}

export function getPrincipalLabel(hat: Hat, isPlatform: boolean): string {
  if (isPlatform) return 'TitanTV'
  return hat === 'operating' ? 'Organizador' : 'Cliente'
}
