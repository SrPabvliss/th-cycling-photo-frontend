import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { computed } from 'vue'
import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { TENANT_PROFILE_QUERY_KEYS } from '../../constants/query-keys'
import type { TenantProfileResponse } from '../../types/responses/tenant-profile.response'

export function useTenantProfile(enabled?: Ref<boolean>) {
  return useQuery({
    queryKey: TENANT_PROFILE_QUERY_KEYS.profile(),
    queryFn: async () => {
      const response = await httpClient.get<TenantProfileResponse>(API_ROUTES.TENANT_PROFILE.BASE)
      return response.data
    },
    enabled: computed(() => enabled?.value ?? true),
  })
}
