import type { RouteRecordRaw } from 'vue-router'

export const RETOUCH_PATH = '/retouch'

export const RETOUCH_ROUTE_NAMES = {
  QUEUE: 'retouch-queue',
} as const

export const retouchRoutes: RouteRecordRaw[] = [
  {
    path: RETOUCH_PATH,
    name: RETOUCH_ROUTE_NAMES.QUEUE,
    component: () => import('./presentation/views/RetouchQueueView.vue'),
  },
]
