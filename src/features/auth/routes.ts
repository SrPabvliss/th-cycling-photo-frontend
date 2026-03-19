import type { RouteRecordRaw } from 'vue-router'

export const AUTH_PATH = '/login'

export const AUTH_ROUTE_NAMES = {
  LOGIN: 'auth-login',
} as const

export const authRoutes: RouteRecordRaw[] = [
  {
    path: AUTH_PATH,
    name: AUTH_ROUTE_NAMES.LOGIN,
    component: () => import('./presentation/views/LoginView.vue'),
    meta: { public: true },
  },
]
