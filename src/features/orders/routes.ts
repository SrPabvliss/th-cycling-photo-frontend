import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'

import { PERMISSIONS } from '@/core/auth/permissions'

export const ORDERS_PATH = ROUTE_PATHS.ORDERS

export const ORDER_ROUTE_NAMES = {
  LIST: 'orders-list',
} as const

export const orderRoutes: RouteRecordRaw[] = [
  {
    path: 'orders',
    name: ORDER_ROUTE_NAMES.LIST,
    component: () => import('./presentation/views/OrdersListView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.ORDER_READ] },
  },
]
