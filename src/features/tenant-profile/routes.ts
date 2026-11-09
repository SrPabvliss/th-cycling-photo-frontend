import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS, segmentOf } from '@/core/navigation/route-paths'

export const BUSINESS_PROFILE_PATH = ROUTE_PATHS.BUSINESS_PROFILE

export const TENANT_PROFILE_ROUTE_NAMES = {
  PROFILE: ROUTE_NAMES.BUSINESS_PROFILE,
} as const

export const tenantProfileRoutes: RouteRecordRaw[] = [
  {
    path: segmentOf(BUSINESS_PROFILE_PATH),
    name: TENANT_PROFILE_ROUTE_NAMES.PROFILE,
    component: () => import('@/features/account/presentation/views/ProfileAdminView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Perfil',
    },
  },
]
