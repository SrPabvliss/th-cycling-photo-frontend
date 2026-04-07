import type { RouteRecordRaw } from 'vue-router'

import { USER_ROLES } from '@/core/auth/role-config'

export const ORDERS_PATH = '/orders'

export const ORDER_ROUTE_NAMES = {
  LIST: 'orders-list',
  DETAIL: 'orders-detail',
} as const

export const orderRoutes: RouteRecordRaw[] = [
  {
    path: 'orders',
    name: ORDER_ROUTE_NAMES.LIST,
    component: () => import('./presentation/views/OrdersListView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.ADMIN] },
  },
  {
    path: 'orders/:id',
    name: ORDER_ROUTE_NAMES.DETAIL,
    component: () => import('./presentation/views/OrderDetailView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.ADMIN] },
  },
]
