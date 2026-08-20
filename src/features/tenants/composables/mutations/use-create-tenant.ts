import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'
import type { ICreateTenantRequest } from '../../types/requests/create-tenant.request'

export function useCreateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ICreateTenantRequest) => {
      const response = await httpClient.post<{ id: string }>('/tenants', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })
}
