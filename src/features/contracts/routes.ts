import type { RouteRecordRaw } from 'vue-router'

export const CONTRACT_ROUTE_NAMES = {
  ACCEPT: 'contract-accept',
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
