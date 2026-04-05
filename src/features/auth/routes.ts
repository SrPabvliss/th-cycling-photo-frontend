import type { RouteRecordRaw } from 'vue-router'

export const AUTH_PATH = '/login'
export const REGISTER_PATH = '/register'

export const AUTH_ROUTE_NAMES = {
  LOGIN: 'auth-login',
  REGISTER: 'auth-register',
} as const

export const authRoutes: RouteRecordRaw[] = [
  {
    path: AUTH_PATH,
    name: AUTH_ROUTE_NAMES.LOGIN,
    component: () => import('./presentation/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: REGISTER_PATH,
    name: AUTH_ROUTE_NAMES.REGISTER,
    component: () => import('./presentation/views/RegisterView.vue'),
    meta: { public: true },
  },
]
