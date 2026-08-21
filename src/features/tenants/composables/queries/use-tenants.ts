import { useQuery } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'
import type { TenantListResponse } from '../../types/responses/tenant-list.response'

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await httpClient.get<TenantListResponse[]>('/tenants')
      return response.data
    },
  })
}
