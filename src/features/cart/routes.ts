import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'

export const CHECKOUT_PATH = ROUTE_PATHS.CHECKOUT

export function checkoutPath(eventId: string): string {
  return `${CHECKOUT_PATH}/${eventId}`
}

export const CART_ROUTE_NAMES = {
  CHECKOUT: ROUTE_NAMES.CART_CHECKOUT,
  PAYMENT_METHOD: ROUTE_NAMES.CART_PAYMENT_METHOD,
} as const

export const cartRoutes: RouteRecordRaw[] = [
  {
    path: `${CHECKOUT_PATH}/:eventId`,
    name: CART_ROUTE_NAMES.CHECKOUT,
    component: () => import('./presentation/views/CheckoutView.vue'),
    meta: { public: true, shell: { footer: false } },
  },
  {
    path: `${CHECKOUT_PATH}/:eventId/method`,
    name: CART_ROUTE_NAMES.PAYMENT_METHOD,
    component: () => import('./presentation/views/PaymentMethodView.vue'),
    meta: { requiresAuth: true, shell: { footer: false } },
  },
]
