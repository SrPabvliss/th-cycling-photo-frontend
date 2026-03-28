import type { RouteRecordRaw } from 'vue-router'

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
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: 'orders/:id',
    name: ORDER_ROUTE_NAMES.DETAIL,
    component: () => import('./presentation/views/OrderDetailView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
]
