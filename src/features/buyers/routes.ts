import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'

import { PERMISSIONS } from '@/core/auth/permissions'

export const BUYERS_PATH = ROUTE_PATHS.BUYERS

export const BUYERS_ROUTE_NAMES = {
  LIST: 'buyers-list',
  DETAIL: 'buyers-detail',
} as const

export const buyerRoutes: RouteRecordRaw[] = [
  {
    path: BUYERS_PATH,
    name: BUYERS_ROUTE_NAMES.LIST,
    component: () => import('./presentation/views/BuyersListView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.BUYER_READ] },
  },
  {
    path: `${BUYERS_PATH}/:id`,
    name: BUYERS_ROUTE_NAMES.DETAIL,
    component: () => import('./presentation/components/BuyerDetail/BuyerDetailPage.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.BUYER_READ] },
  },
]
