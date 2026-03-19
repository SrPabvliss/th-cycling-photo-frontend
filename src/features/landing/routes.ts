import type { RouteRecordRaw } from 'vue-router'

export const LANDING_PATH = '/'

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
