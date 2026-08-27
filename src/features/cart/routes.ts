import type { RouteRecordRaw } from 'vue-router'

export const CHECKOUT_PATH = '/checkout'

export function checkoutPath(eventId: string): string {
  return `${CHECKOUT_PATH}/${eventId}`
}

export const CART_ROUTE_NAMES = {
  CHECKOUT: 'cart-checkout',
} as const

export const cartRoutes: RouteRecordRaw[] = [
  {
    path: `${CHECKOUT_PATH}/:eventId`,
    name: CART_ROUTE_NAMES.CHECKOUT,
    component: () => import('./presentation/views/CheckoutView.vue'),
    meta: { public: true },
  },
]
