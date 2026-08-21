import type { RouteRecordRaw } from 'vue-router'

const PAYMENT_RETURN_PROVIDER = 'payphone'

export const PAYMENT_RETURN_PATH = `/checkout/${PAYMENT_RETURN_PROVIDER}/return`

export const PAYMENT_ROUTE_NAMES = {
  RETURN: 'payment-return',
} as const

export const paymentRoutes: RouteRecordRaw[] = [
  {
    path: PAYMENT_RETURN_PATH,
    name: PAYMENT_ROUTE_NAMES.RETURN,
    component: () => import('./presentation/views/PaymentReturnView.vue'),
    meta: { public: true, provider: PAYMENT_RETURN_PROVIDER },
  },
]
