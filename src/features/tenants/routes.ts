import type { RouteRecordRaw } from 'vue-router'

import { PERMISSIONS } from '@/core/auth/permissions'

export const tenantRoutes: RouteRecordRaw[] = [
  {
    path: 'tenants',
    name: 'TenantsList',
    component: () => import('./presentation/views/TenantsListView.vue'),
    meta: {
      requiresAuth: true,
      permissions: [PERMISSIONS.TENANT_READ],
      title: 'Tenants',
    },
  },
]
