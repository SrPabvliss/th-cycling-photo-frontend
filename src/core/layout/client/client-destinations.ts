import type { RouteLocationRaw } from 'vue-router'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import type { ClientTab } from './client-shell'

export interface IClientDestination {
  tab: ClientTab
  label: string
  to: RouteLocationRaw
}

/**
 * The three places of the client navigation, in order. The header shows them from desktop on and
 * the tab bar on mobile. "Mis fotos" needs a session: the auth guard sends to the login page and
 * brings the person back.
 */
export const CLIENT_DESTINATIONS: readonly IClientDestination[] = [
  { tab: 'home', label: 'Inicio', to: ROUTE_PATHS.LANDING },
  { tab: 'events', label: 'Eventos', to: ROUTE_PATHS.PUBLIC_GALLERY },
  { tab: 'photos', label: 'Mis fotos', to: { name: ROUTE_NAMES.ACCOUNT_ORDERS } },
]
