import type { RouteRecordRaw } from 'vue-router'
import { USER_ROLES } from '@/core/auth/user-roles'
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
    component: () => import('./presentation/views/OperatorRetouchQueueView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
  {
    path: '/operator/events/:eventSlug/retouch',
    name: RETOUCH_ROUTE_NAMES.EVENT_QUEUE,
    component: () => import('./presentation/views/EventRetouchQueueView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
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
    component: () => import('./presentation/views/OperatorRetouchWorkspaceView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
  {
    path: '/operator/events/:eventSlug/retouch/workspace',
    name: RETOUCH_ROUTE_NAMES.EVENT_WORKSPACE,
    component: () => import('./presentation/views/OperatorRetouchWorkspaceView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
]
