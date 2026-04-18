import { EVENTS_PATH } from '@/features/events/routes'
import { ORDERS_PATH } from '@/features/orders/routes'
import { RETOUCH_PATH } from '@/features/retouch/routes'
import { BUYERS_PATH } from '@/features/buyers/routes'
import { OPERATOR_PATH } from '@/features/operator/routes'
import { LANDING_PATH } from '@/features/landing/routes'
import { USER_ROLES, type UserRole } from './user-roles'

export { USER_ROLES, type UserRole } from './user-roles'

export interface INavLink {
  label: string
  to?: string
  disabled?: boolean
}

export interface IRoleConfig {
  homePath: string
  label: string
  navLinks: INavLink[]
}

const ROLE_CONFIGS: Record<UserRole, IRoleConfig> = {
  [USER_ROLES.ADMIN]: {
    homePath: EVENTS_PATH,
    label: 'Administrador',
    navLinks: [
      { label: 'Eventos', to: EVENTS_PATH },
      { label: 'Pedidos', to: ORDERS_PATH },
      { label: 'Retoque', to: RETOUCH_PATH },
      { label: 'Compradores', to: BUYERS_PATH },
    ],
  },
  [USER_ROLES.OPERATOR]: {
    homePath: OPERATOR_PATH,
    label: 'Operador',
    navLinks: [
      { label: 'Dashboard', to: OPERATOR_PATH },
      { label: 'Eventos Asignados', disabled: true },
      { label: 'Clasificación', disabled: true },
      { label: 'Actividad', disabled: true },
      { label: 'Configuración', disabled: true },
    ],
  },
  [USER_ROLES.CUSTOMER]: {
    homePath: LANDING_PATH,
    label: 'Cliente',
    navLinks: [],
  },
}

export function getRoleConfig(role: string): IRoleConfig {
  return ROLE_CONFIGS[role as UserRole] ?? ROLE_CONFIGS[USER_ROLES.CUSTOMER]
}

export function getHomePath(role: string): string {
  return getRoleConfig(role).homePath
}
