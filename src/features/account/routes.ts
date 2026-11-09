import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'

export const ACCOUNT_PATH = ROUTE_PATHS.ACCOUNT

export const ACCOUNT_ROUTE_NAMES = {
  PROFILE: ROUTE_NAMES.ACCOUNT_PROFILE,
  VERIFY_EMAIL: ROUTE_NAMES.ACCOUNT_VERIFY_EMAIL,
  ORDERS: ROUTE_NAMES.ACCOUNT_ORDERS,
  ORDER_DETAIL: ROUTE_NAMES.ACCOUNT_ORDER_DETAIL,
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
    path: `${ACCOUNT_PATH}/verify-email`,
    name: ACCOUNT_ROUTE_NAMES.VERIFY_EMAIL,
    component: () => import('./presentation/views/VerifyEmailView.vue'),
    // Self-scoped verification: authenticated only, like the backend's @Authenticated().
    meta: { requiresAuth: true },
  },
  {
    path: `${ACCOUNT_PATH}/orders`,
    name: ACCOUNT_ROUTE_NAMES.ORDERS,
    component: () => import('./presentation/views/MyOrdersView.vue'),
    // Self-scoped orders: authenticated only, like the backend's @Authenticated().
    meta: { requiresAuth: true },
  },
  {
    path: `${ACCOUNT_PATH}/orders/:id`,
    name: ACCOUNT_ROUTE_NAMES.ORDER_DETAIL,
    component: () => import('./presentation/views/MyOrderDetailView.vue'),
    // Self-scoped orders: authenticated only, like the backend's @Authenticated().
    meta: { requiresAuth: true },
  },
]
