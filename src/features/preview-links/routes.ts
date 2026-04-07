import type { RouteRecordRaw } from 'vue-router'

import { USER_ROLES } from '@/core/auth/role-config'

export const PREVIEW_LINKS_PATH = '/preview-links'

export const PREVIEW_LINK_ROUTE_NAMES = {
  LIST: 'preview-links-list',
  CREATE: 'preview-links-create',
} as const

export const previewLinkRoutes: RouteRecordRaw[] = [
  {
    path: 'events/:eventId/preview-links',
    name: PREVIEW_LINK_ROUTE_NAMES.LIST,
    component: () => import('./presentation/views/PreviewLinksListView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.ADMIN] },
  },
  {
    path: 'events/:eventId/preview-links/create',
    name: PREVIEW_LINK_ROUTE_NAMES.CREATE,
    component: () => import('./presentation/views/PreviewGenerationView.vue'),
    meta: { requiresAuth: true, roles: [USER_ROLES.ADMIN] },
  },
]
