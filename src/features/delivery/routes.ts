import type { RouteRecordRaw } from 'vue-router'

export const DELIVERY_ROUTE_NAMES = {
  DELIVERY: 'delivery',
} as const

export const deliveryRoutes: RouteRecordRaw[] = [
  {
    path: '/delivery/:token',
    name: DELIVERY_ROUTE_NAMES.DELIVERY,
    component: () => import('./presentation/views/DeliveryView.vue'),
    meta: { public: true },
  },
]
