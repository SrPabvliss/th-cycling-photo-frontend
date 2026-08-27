import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'

export const LEGAL_PATHS = {
  PRIVACY: ROUTE_PATHS.PRIVACY,
  TERMS: ROUTE_PATHS.TERMS,
  TENANT_TERMS: ROUTE_PATHS.TENANT_TERMS,
} as const

export const LEGAL_ROUTE_NAMES = {
  PRIVACY: 'legal-privacy',
  TERMS: 'legal-terms',
  TENANT_TERMS: 'legal-tenant-terms',
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
  {
    path: LEGAL_PATHS.TENANT_TERMS,
    name: LEGAL_ROUTE_NAMES.TENANT_TERMS,
    component: () => import('./presentation/views/TenantTermsView.vue'),
    meta: { public: true },
  },
]
