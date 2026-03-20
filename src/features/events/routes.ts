import type { RouteRecordRaw } from 'vue-router'

export const EVENTS_PATH = '/events'

export const EVENT_ROUTE_NAMES = {
  LIST: 'events-list',
  CREATE: 'events-create',
  DETAIL: 'events-detail',
  EDIT: 'events-edit',
} as const

export const eventRoutes: RouteRecordRaw[] = [
  {
    path: 'events',
    name: EVENT_ROUTE_NAMES.LIST,
    component: () => import('./presentation/views/EventListView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: 'events/create',
    name: EVENT_ROUTE_NAMES.CREATE,
    component: () => import('./presentation/views/EventCreateView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: 'events/:id',
    name: EVENT_ROUTE_NAMES.DETAIL,
    component: () => import('./presentation/views/EventDetailView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: 'events/:id/edit',
    name: EVENT_ROUTE_NAMES.EDIT,
    component: () => import('./presentation/views/EventEditView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
]
