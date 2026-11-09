import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS, segmentOf } from '@/core/navigation/route-paths'
import { PERMISSIONS } from '@/core/auth/permissions'

export const ORGANIZERS_PATH = ROUTE_PATHS.ORGANIZERS

export const ORGANIZER_ROUTE_NAMES = {
  LIST: ROUTE_NAMES.ORGANIZERS_LIST,
  DETAIL: ROUTE_NAMES.ORGANIZERS_DETAIL,
} as const

export const organizerRoutes: RouteRecordRaw[] = [
  {
    path: segmentOf(ORGANIZERS_PATH),
    name: ORGANIZER_ROUTE_NAMES.LIST,
    component: () => import('./presentation/views/OrganizersListView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.TENANT_READ], title: 'Organizadores' },
  },
  {
    path: `${segmentOf(ORGANIZERS_PATH)}/:id`,
    name: ORGANIZER_ROUTE_NAMES.DETAIL,
    component: () => import('./presentation/components/OrganizerDetail/OrganizerDetailPage.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.TENANT_READ], title: 'Organizador' },
  },
]
