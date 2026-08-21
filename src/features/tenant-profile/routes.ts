import type { RouteRecordRaw } from 'vue-router'

import { PERMISSIONS } from '@/core/auth/permissions'

export const tenantProfileRoutes: RouteRecordRaw[] = [
  {
    path: 'mi-perfil',
    name: 'TenantProfile',
    component: () => import('./presentation/views/TenantProfileView.vue'),
    meta: {
      requiresAuth: true,
      permissions: [PERMISSIONS.TENANT_PROFILE_READ],
      title: 'Mi perfil',
    },
  },
]
