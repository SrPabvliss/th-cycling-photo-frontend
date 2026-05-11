import type { RouteRecordRaw } from 'vue-router'

import { USER_ROLES } from '@/core/auth/user-roles'

export const OPERATOR_PATH = '/operator'

export const OPERATOR_ROUTE_NAMES = {
  DASHBOARD: 'operator-dashboard',
  EVENT_REVIEW_QUEUE: 'operator-event-review-queue',
  EVENT_REVIEW_WORKSPACE: 'operator-event-review-workspace',
  CROSS_EVENT_REVIEW_WORKSPACE: 'operator-review-workspace',
  PHOTO_REVIEW: 'operator-photo-review',
} as const

/**
 * Operator routes that render INSIDE the AppLayout (with topbar/nav):
 * dashboard + grid intermedia per-event.
 */
export const operatorRoutes: RouteRecordRaw[] = [
  {
    path: OPERATOR_PATH,
    name: OPERATOR_ROUTE_NAMES.DASHBOARD,
    component: () => import('./presentation/views/OperatorDashboardView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
  {
    path: `${OPERATOR_PATH}/events/:eventSlug/review`,
    name: OPERATOR_ROUTE_NAMES.EVENT_REVIEW_QUEUE,
    component: () => import('./presentation/views/OperatorEventReviewQueueView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
]

/**
 * Operator workspace routes (rendered WITHOUT AppLayout chrome). Each one
 * mounts a fullscreen review workspace with its own internal header.
 */
export const operatorWorkspaceRoutes: RouteRecordRaw[] = [
  {
    path: `${OPERATOR_PATH}/events/:eventSlug/review/workspace`,
    name: OPERATOR_ROUTE_NAMES.EVENT_REVIEW_WORKSPACE,
    component: () => import('@/features/review/presentation/views/ReviewWorkspaceView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
  {
    path: `${OPERATOR_PATH}/review`,
    name: OPERATOR_ROUTE_NAMES.CROSS_EVENT_REVIEW_WORKSPACE,
    component: () => import('./presentation/views/OperatorReviewWorkspaceView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
  {
    path: `${OPERATOR_PATH}/photos/:photoSlug/review`,
    name: OPERATOR_ROUTE_NAMES.PHOTO_REVIEW,
    component: () => import('./presentation/views/SinglePhotoReviewWorkspaceView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.OPERATOR] },
  },
]
