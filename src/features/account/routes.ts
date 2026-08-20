import type { RouteRecordRaw } from 'vue-router'

import { USER_ROLES } from '@/core/auth/user-roles'

export const ACCOUNT_PATH = '/account'

export const ACCOUNT_ROUTE_NAMES = {
  PROFILE: 'account-profile',
} as const

export const accountRoutes: RouteRecordRaw[] = [
  {
    path: `${ACCOUNT_PATH}/profile`,
    name: ACCOUNT_ROUTE_NAMES.PROFILE,
    component: () => import('./presentation/views/ProfileView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.CUSTOMER] },
  },
]
