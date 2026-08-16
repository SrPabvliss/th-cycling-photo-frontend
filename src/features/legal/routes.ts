import type { RouteRecordRaw } from 'vue-router'

export const LEGAL_PATHS = {
  PRIVACY: '/privacidad',
  TERMS: '/terminos',
} as const

export const LEGAL_ROUTE_NAMES = {
  PRIVACY: 'legal-privacy',
  TERMS: 'legal-terms',
} as const

export const legalRoutes: RouteRecordRaw[] = [
  {
    path: LEGAL_PATHS.PRIVACY,
    name: LEGAL_ROUTE_NAMES.PRIVACY,
    component: () => import('./presentation/views/PrivacyView.vue'),
    meta: { public: true },
  },
  {
    path: LEGAL_PATHS.TERMS,
    name: LEGAL_ROUTE_NAMES.TERMS,
    component: () => import('./presentation/views/TermsView.vue'),
    meta: { public: true },
  },
]
