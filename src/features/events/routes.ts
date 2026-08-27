import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'

import { PERMISSIONS } from '@/core/auth/permissions'

export const EVENTS_PATH = ROUTE_PATHS.EVENTS

export const EVENT_ROUTE_NAMES = {
  LIST: 'events-list',
  CREATE: 'events-create',
  DETAIL: 'events-detail',
  EDIT: 'events-edit',
  CONFIGURATION_EDIT: 'events-configuration-edit',
} as const

export const eventRoutes: RouteRecordRaw[] = [
  {
    path: 'events',
    name: EVENT_ROUTE_NAMES.LIST,
    component: () => import('./presentation/views/EventListView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.EVENT_READ] },
  },
  {
    path: 'events/create',
    name: EVENT_ROUTE_NAMES.CREATE,
    component: () => import('./presentation/views/EventCreateWizard/EventCreateWizard.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.EVENT_CREATE] },
  },
  {
    path: 'events/:slug',
    name: EVENT_ROUTE_NAMES.DETAIL,
    component: () => import('./presentation/views/EventDetail/EventDetailView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.EVENT_READ] },
  },
  {
    path: 'events/:slug/edit',
    name: EVENT_ROUTE_NAMES.EDIT,
    component: () => import('./presentation/views/EventSettings/EventSettingsView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.EVENT_UPDATE] },
  },
  {
    path: 'events/:slug/configuration',
    name: EVENT_ROUTE_NAMES.CONFIGURATION_EDIT,
    component: () => import('./presentation/views/EventSettings/EventSettingsView.vue'),
    meta: { requiresAuth: true, permissions: [PERMISSIONS.EVENT_UPDATE] },
  },
]
