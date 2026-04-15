import type { RouteRecordRaw } from 'vue-router'

export const PUBLIC_GALLERY_PATH = '/gallery'

export const PUBLIC_GALLERY_ROUTE_NAMES = {
  EVENT_LIST: 'public-event-list',
  EVENT_GALLERY: 'public-event-gallery',
} as const

export const publicGalleryRoutes: RouteRecordRaw[] = [
  {
    path: `${PUBLIC_GALLERY_PATH}`,
    name: PUBLIC_GALLERY_ROUTE_NAMES.EVENT_LIST,
    component: () => import('./presentation/views/PublicEventListView.vue'),
    meta: { public: true },
  },
  {
    path: `${PUBLIC_GALLERY_PATH}/:slug`,
    name: PUBLIC_GALLERY_ROUTE_NAMES.EVENT_GALLERY,
    component: () => import('./presentation/views/PublicEventGalleryView.vue'),
    meta: { public: true },
  },
]
