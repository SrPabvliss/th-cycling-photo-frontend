import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'

const PAYMENT_RETURN_PROVIDER = 'payphone'

export const PAYMENT_RETURN_PATH = `/checkout/${PAYMENT_RETURN_PROVIDER}/return`
export const PAYMENT_BOX_PATH = ROUTE_PATHS.PAYMENT_BOX

export const PAYMENT_ROUTE_NAMES = {
  RETURN: 'payment-return',
  BOX: 'payment-box',
  CONFIRMED: ROUTE_NAMES.PAYMENT_CONFIRMED,
} as const

export const paymentRoutes: RouteRecordRaw[] = [
  {
    path: PAYMENT_RETURN_PATH,
    name: PAYMENT_ROUTE_NAMES.RETURN,
    component: () => import('./presentation/views/PaymentReturnView.vue'),
    meta: { public: true, provider: PAYMENT_RETURN_PROVIDER, shell: { footer: false } },
  },
  {
    path: PAYMENT_BOX_PATH,
    name: PAYMENT_ROUTE_NAMES.BOX,
    component: () => import('./presentation/views/PaymentBoxView.vue'),
    meta: { requiresAuth: true, shell: { footer: false } },
  },
  {
    path: `${ROUTE_PATHS.CHECKOUT}/confirmed/:orderId`,
    name: PAYMENT_ROUTE_NAMES.CONFIRMED,
    component: () => import('./presentation/views/PaymentConfirmedView.vue'),
    meta: { requiresAuth: true, shell: { footer: false } },
  },
]
