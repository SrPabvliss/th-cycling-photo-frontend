import type { RouteRecordRaw } from 'vue-router'

export const ACCOUNT_PATH = '/account'

export const ACCOUNT_ROUTE_NAMES = {
  PROFILE: 'account-profile',
  ORDERS: 'account-orders',
  ORDER_DETAIL: 'account-order-detail',
} as const

export const accountRoutes: RouteRecordRaw[] = [
  {
    path: `${ACCOUNT_PATH}/profile`,
    name: ACCOUNT_ROUTE_NAMES.PROFILE,
    component: () => import('./presentation/views/ProfileView.vue'),
    // Self-scoped profile: authenticated only, like the backend's @Authenticated().
    meta: { requiresAuth: true },
  },
  {
    path: `${ACCOUNT_PATH}/orders`,
    name: ACCOUNT_ROUTE_NAMES.ORDERS,
    component: () => import('./presentation/views/MyOrdersView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.CUSTOMER] },
  },
  {
    path: `${ACCOUNT_PATH}/orders/:id`,
    name: ACCOUNT_ROUTE_NAMES.ORDER_DETAIL,
    component: () => import('./presentation/views/MyOrderDetailView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.CUSTOMER] },
  },
]
