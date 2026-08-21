import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { TENANT_PROFILE_QUERY_KEYS } from '../../constants/query-keys'
import type { UpdateTenantProfileRequest } from '../../types/requests/update-tenant-profile.request'

export function useUpdateTenantProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateTenantProfileRequest) => {
      await httpClient.patch(API_ROUTES.TENANT_PROFILE.BASE, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_PROFILE_QUERY_KEYS.profile() })
    },
  })
}
