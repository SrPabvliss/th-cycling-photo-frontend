import type { RouteRecordRaw } from 'vue-router'

const PAYMENT_RETURN_PROVIDER = 'payphone'

export const PAYMENT_RETURN_PATH = `/checkout/${PAYMENT_RETURN_PROVIDER}/return`
export const PAYMENT_BOX_PATH = '/checkout/pago'

export const PAYMENT_ROUTE_NAMES = {
  RETURN: 'payment-return',
  BOX: 'payment-box',
} as const

export const paymentRoutes: RouteRecordRaw[] = [
  {
    path: PAYMENT_RETURN_PATH,
    name: PAYMENT_ROUTE_NAMES.RETURN,
    component: () => import('./presentation/views/PaymentReturnView.vue'),
    meta: { public: true, provider: PAYMENT_RETURN_PROVIDER },
  },
  {
    path: PAYMENT_BOX_PATH,
    name: PAYMENT_ROUTE_NAMES.BOX,
    component: () => import('./presentation/views/PaymentBoxView.vue'),
    meta: { requiresAuth: true },
  },
]
