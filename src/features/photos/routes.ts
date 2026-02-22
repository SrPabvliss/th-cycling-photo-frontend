import type { RouteRecordRaw } from 'vue-router'

export const PHOTOS_PATH = '/photos'

export const PHOTO_ROUTE_NAMES = {
  GALLERY: 'photos-gallery',
  UPLOAD: 'photos-upload',
  DETAIL: 'photos-detail',
} as const

export const photoRoutes: RouteRecordRaw[] = [
  {
    path: 'events/:eventId/photos',
    name: PHOTO_ROUTE_NAMES.GALLERY,
    component: () => import('./presentation/views/PhotoGalleryView.vue'),
  },
  {
    path: 'events/:eventId/photos/upload',
    name: PHOTO_ROUTE_NAMES.UPLOAD,
    component: () => import('./presentation/views/PhotoUploadView.vue'),
  },
  {
    path: 'photos/:id',
    name: PHOTO_ROUTE_NAMES.DETAIL,
    component: () => import('./presentation/views/PhotoDetailView.vue'),
  },
]
