import type { RouteRecordRaw } from 'vue-router'

import { USER_ROLES } from '@/core/auth/role-config'

export const OPERATOR_PATH = '/operator'

export const OPERATOR_ROUTE_NAMES = {
  DASHBOARD: 'operator-dashboard',
} as const

export const operatorRoutes: RouteRecordRaw[] = [
  {
    path: OPERATOR_PATH,
    name: OPERATOR_ROUTE_NAMES.DASHBOARD,
    component: () => import('./presentation/views/OperatorDashboardView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
]
