import type { RouteRecordRaw } from 'vue-router'

export const BUYERS_PATH = '/buyers'

export const BUYERS_ROUTE_NAMES = {
  LIST: 'buyers-list',
} as const

export const buyerRoutes: RouteRecordRaw[] = [
  {
    path: BUYERS_PATH,
    name: BUYERS_ROUTE_NAMES.LIST,
    component: () => import('./presentation/views/BuyersListView.vue'),
    meta: { roles: ['admin'] },
  },
]
