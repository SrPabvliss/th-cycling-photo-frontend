import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toContractListItems } from '../../mappers/contract-list-item.mapper'
import type { IApiContractListItem } from '../../types/responses/contract-list.response'
import { TENANT_PROFILE_QUERY_KEYS } from '../../constants/query-keys'

export function useMyContracts(enabled?: Ref<boolean>) {
  return useQuery({
    queryKey: TENANT_PROFILE_QUERY_KEYS.contracts(),
    queryFn: async () => {
      const response = await httpClient.get<IApiContractListItem[]>(API_ROUTES.CONTRACTS.MINE)
      return toContractListItems(response.data)
    },
    enabled: computed(() => enabled?.value ?? true),
  })
}
