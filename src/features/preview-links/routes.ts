import type { RouteRecordRaw } from 'vue-router'

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
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: 'events/:eventId/preview-links/create',
    name: PREVIEW_LINK_ROUTE_NAMES.CREATE,
    component: () => import('./presentation/views/PreviewGenerationView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
]
