import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'

export const AUTH_PATH = ROUTE_PATHS.LOGIN
export const REGISTER_PATH = ROUTE_PATHS.REGISTER
export const FORGOT_PASSWORD_PATH = ROUTE_PATHS.FORGOT_PASSWORD
export const RESET_PASSWORD_PATH = ROUTE_PATHS.RESET_PASSWORD

export const AUTH_ROUTE_NAMES = {
  LOGIN: 'auth-login',
  REGISTER: 'auth-register',
  FORGOT_PASSWORD: 'auth-forgot-password',
  RESET_PASSWORD: 'auth-reset-password',
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
  {
    path: FORGOT_PASSWORD_PATH,
    name: AUTH_ROUTE_NAMES.FORGOT_PASSWORD,
    component: () => import('./presentation/views/ForgotPasswordView.vue'),
    meta: { public: true },
  },
  {
    path: RESET_PASSWORD_PATH,
    name: AUTH_ROUTE_NAMES.RESET_PASSWORD,
    component: () => import('./presentation/views/ResetPasswordView.vue'),
    meta: { public: true },
  },
]
