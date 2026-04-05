import type { RouteRecordRaw } from 'vue-router'

export const CHECKOUT_PATH = '/checkout'

export const CART_ROUTE_NAMES = {
  CHECKOUT: 'cart-checkout',
} as const

export const cartRoutes: RouteRecordRaw[] = [
  {
    path: CHECKOUT_PATH,
    name: CART_ROUTE_NAMES.CHECKOUT,
    component: () => import('./presentation/views/CheckoutView.vue'),
    meta: { public: true },
  },
]
