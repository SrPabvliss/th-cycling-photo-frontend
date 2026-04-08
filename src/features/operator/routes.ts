import type { RouteRecordRaw } from 'vue-router'

import { USER_ROLES } from '@/core/auth/user-roles'

export const OPERATOR_PATH = '/operator'

export const OPERATOR_ROUTE_NAMES = {
  DASHBOARD: 'operator-dashboard',
  EVENT_WORKSPACE: 'operator-event-workspace',
} as const

export const operatorRoutes: RouteRecordRaw[] = [
  {
    path: OPERATOR_PATH,
    name: OPERATOR_ROUTE_NAMES.DASHBOARD,
    component: () => import('./presentation/views/OperatorDashboardView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
  {
    path: `${OPERATOR_PATH}/events/:eventId`,
    name: OPERATOR_ROUTE_NAMES.EVENT_WORKSPACE,
    component: () => import('./presentation/views/OperatorEventWorkspaceView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
]
