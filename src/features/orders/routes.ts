import type { RouteRecordRaw } from 'vue-router'

import { PERMISSIONS } from '@/core/auth/permissions'

export const ORDERS_PATH = '/orders'

export const ORDER_ROUTE_NAMES = {
  LIST: 'orders-list',
} as const

export const orderRoutes: RouteRecordRaw[] = [
  {
    path: ORDERS_PATH,
    name: ORDER_ROUTE_NAMES.LIST,
    component: () => import('./presentation/views/OrdersListView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.ORDER_READ] },
  },
]
