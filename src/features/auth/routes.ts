import type { RouteRecordRaw } from 'vue-router'

export const AUTH_PATH = '/login'
export const REGISTER_PATH = '/register'
export const FORGOT_PASSWORD_PATH = '/forgot-password'
export const RESET_PASSWORD_PATH = '/reset-password'

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
