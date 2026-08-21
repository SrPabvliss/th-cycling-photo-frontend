import type { RouteRecordRaw } from 'vue-router'

import { PERMISSIONS } from '@/core/auth/permissions'

export const PHOTOS_PATH = '/photos'

export const PHOTO_ROUTE_NAMES = {
  GALLERY: 'photos-gallery',
  UPLOAD: 'photos-upload',
  DETAIL: 'photos-detail',
} as const

export const photoRoutes: RouteRecordRaw[] = [
  {
    path: 'events/:slug/photos',
    name: PHOTO_ROUTE_NAMES.GALLERY,
    component: () => import('./presentation/views/PhotoGalleryView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.PHOTO_READ] },
  },
  {
    path: 'events/:slug/photos/upload',
    name: PHOTO_ROUTE_NAMES.UPLOAD,
    component: () => import('./presentation/views/PhotoUploadView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.PHOTO_READ] },
  },
  {
    path: 'photos/:slug',
    name: PHOTO_ROUTE_NAMES.DETAIL,
    component: () => import('./presentation/views/PhotoDetailView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.PHOTO_READ] },
  },
]
