import type { RouteRecordRaw } from 'vue-router'
import { USER_ROLES } from '@/core/auth/user-roles'

export const REVIEW_ROUTE_NAMES = {
  WORKSPACE: 'review-workspace',
  SINGLE_PHOTO: 'review-single-photo',
} as const

export const reviewRoutes: RouteRecordRaw[] = [
  {
    path: '/events/:eventSlug/review',
    name: REVIEW_ROUTE_NAMES.WORKSPACE,
    component: () => import('./presentation/views/ReviewWorkspaceView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATOR] },
  },
  {
    path: '/photos/:photoSlug/review',
    name: REVIEW_ROUTE_NAMES.SINGLE_PHOTO,
    component: () => import('./presentation/views/SinglePhotoReviewWorkspaceView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATOR] },
  },
]
