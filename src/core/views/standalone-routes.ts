import type { RouteRecordRaw } from 'vue-router'

export const STANDALONE_PATHS = {
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
  ACCESS_DENIED: '/access-denied',
} as const

export const STANDALONE_ROUTE_NAMES = {
  NOT_FOUND: 'not-found',
  SERVER_ERROR: 'server-error',
  ACCESS_DENIED: 'access-denied',
} as const

// Sample of the client base (theme, loading pieces). Never part of a production build.
const devRoutes: RouteRecordRaw[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/ui',
        name: 'dev-ui-sample',
        component: () => import('./UiSampleView.vue'),
        meta: { public: true },
      },
    ]
  : []

export const standaloneRoutes: RouteRecordRaw[] = [
  {
    path: STANDALONE_PATHS.NOT_FOUND,
    name: STANDALONE_ROUTE_NAMES.NOT_FOUND,
    component: () => import('./NotFoundView.vue'),
    meta: { public: true },
  },
  {
    path: STANDALONE_PATHS.SERVER_ERROR,
    name: STANDALONE_ROUTE_NAMES.SERVER_ERROR,
    component: () => import('./ServerErrorView.vue'),
    meta: { public: true },
  },
  {
    path: STANDALONE_PATHS.ACCESS_DENIED,
    name: STANDALONE_ROUTE_NAMES.ACCESS_DENIED,
    component: () => import('./AccessDeniedView.vue'),
    meta: { public: true },
  },
  ...devRoutes,
]
