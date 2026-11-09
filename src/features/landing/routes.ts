import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'

export const LANDING_PATH = ROUTE_PATHS.LANDING

export const LANDING_ROUTE_NAMES = {
  HOME: 'landing',
} as const

export const landingRoutes: RouteRecordRaw[] = [
  {
    path: LANDING_PATH,
    name: LANDING_ROUTE_NAMES.HOME,
    component: () => import('./presentation/views/LandingView.vue'),
    meta: { public: true },
  },
]
