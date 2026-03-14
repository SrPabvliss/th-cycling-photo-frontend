import type { RouteRecordRaw } from 'vue-router'

export const CLASSIFICATION_ROUTE_NAMES = {
  WORKSPACE: 'classification-workspace',
} as const

export const classificationRoutes: RouteRecordRaw[] = [
  {
    path: '/events/:eventId/classify',
    name: CLASSIFICATION_ROUTE_NAMES.WORKSPACE,
    component: () => import('./presentation/views/ClassificationWorkspaceView.vue'),
  },
]
