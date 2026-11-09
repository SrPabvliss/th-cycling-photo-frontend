import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES } from '@/core/navigation/route-names'

export const CONTRACT_ROUTE_NAMES = {
  ACCEPT: ROUTE_NAMES.CONTRACT_ACCEPT,
} as const

export const contractRoutes: RouteRecordRaw[] = [
  {
    path: 'contracts/:token',
    name: CONTRACT_ROUTE_NAMES.ACCEPT,
    component: () => import('./presentation/views/ContractAcceptView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Contrato de servicio',
    },
  },
]
