import type { RouteRecordRaw } from 'vue-router'

export const CLIENT_GALLERY_ROUTE_NAMES = {
  GALLERY: 'client-gallery',
} as const

export const clientGalleryRoutes: RouteRecordRaw[] = [
  {
    path: '/preview/:token',
    name: CLIENT_GALLERY_ROUTE_NAMES.GALLERY,
    component: () => import('./presentation/views/ClientGalleryView.vue'),
    meta: { public: true },
  },
]
