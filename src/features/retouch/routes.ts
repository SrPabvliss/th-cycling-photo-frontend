import type { RouteRecordRaw } from 'vue-router'
import { PERMISSIONS } from '@/core/auth/permissions'
import { RETOUCH_PATH, RETOUCH_ROUTE_NAMES } from './constants/retouch-routes'

export { RETOUCH_PATH, RETOUCH_ROUTE_NAMES }

/**
 * Retouch routes that render INSIDE the AppLayout (with topbar/nav):
 * cross-event grid + per-event grid.
 */
export const retouchRoutes: RouteRecordRaw[] = [
  {
    path: RETOUCH_PATH,
    name: RETOUCH_ROUTE_NAMES.OPERATOR_QUEUE,
    component: () => import('./presentation/views/RetouchQueueView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.PHOTO_RETOUCH_READ] },
  },
  {
    path: '/events/:eventSlug/retouch',
    name: RETOUCH_ROUTE_NAMES.EVENT_QUEUE,
    component: () => import('./presentation/views/EventRetouchQueueView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.PHOTO_RETOUCH_READ] },
  },
]

/**
 * Retouch workspace routes (rendered WITHOUT AppLayout). Each one mounts a
 * fullscreen workspace with its own internal header.
 */
export const retouchWorkspaceRoutes: RouteRecordRaw[] = [
  {
    path: `${RETOUCH_PATH}/workspace`,
    name: RETOUCH_ROUTE_NAMES.OPERATOR_WORKSPACE,
    component: () => import('./presentation/views/RetouchWorkspaceView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.PHOTO_RETOUCH_READ] },
  },
  {
    path: '/events/:eventSlug/retouch/workspace',
    name: RETOUCH_ROUTE_NAMES.EVENT_WORKSPACE,
    component: () => import('./presentation/views/RetouchWorkspaceView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.PHOTO_RETOUCH_READ] },
  },
]
