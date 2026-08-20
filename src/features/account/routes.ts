import type { RouteRecordRaw } from 'vue-router'

export const ACCOUNT_PATH = '/account'

export const ACCOUNT_ROUTE_NAMES = {
  PROFILE: 'account-profile',
} as const

export const accountRoutes: RouteRecordRaw[] = [
  {
    path: `${ACCOUNT_PATH}/profile`,
    name: ACCOUNT_ROUTE_NAMES.PROFILE,
    component: () => import('./presentation/views/ProfileView.vue'),
    // Self-scoped profile: authenticated only, like the backend's @Authenticated().
    meta: { requiresAuth: true },
  },
]
