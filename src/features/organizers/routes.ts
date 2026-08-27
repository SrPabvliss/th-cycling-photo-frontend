import type { RouteRecordRaw } from 'vue-router'

import { PERMISSIONS } from '@/core/auth/permissions'

export const ORGANIZERS_PATH = '/organizers'

export const ORGANIZER_ROUTE_NAMES = {
  LIST: 'organizers-list',
  DETAIL: 'organizers-detail',
} as const

export const organizerRoutes: RouteRecordRaw[] = [
  {
    path: 'organizers',
    name: ORGANIZER_ROUTE_NAMES.LIST,
    component: () => import('./presentation/views/OrganizersListView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.TENANT_READ], title: 'Organizadores' },
  },
  {
    path: 'organizers/:id',
    name: ORGANIZER_ROUTE_NAMES.DETAIL,
    component: () => import('./presentation/components/OrganizerDetail/OrganizerDetailPage.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.TENANT_READ], title: 'Organizador' },
  },
]
