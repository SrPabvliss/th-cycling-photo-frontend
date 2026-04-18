import type { RouteRecordRaw } from 'vue-router'

import { USER_ROLES } from '@/core/auth/user-roles'

export const CLASSIFICATION_ROUTE_NAMES = {
  WORKSPACE: 'classification-workspace',
} as const

export const classificationRoutes: RouteRecordRaw[] = [
  {
    path: '/events/:eventId/classify',
    name: CLASSIFICATION_ROUTE_NAMES.WORKSPACE,
    component: () => import('./presentation/views/ClassificationWorkspaceView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATOR] },
  },
]
