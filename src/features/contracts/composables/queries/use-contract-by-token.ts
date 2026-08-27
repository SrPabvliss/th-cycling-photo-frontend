import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'

import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { CONTRACT_QUERY_KEYS } from '../../constants/query-keys'
import { toContractOffer } from '../../mappers/contract-offer.mapper'
import type { IApiContractOffer } from '../../types/responses/contract-offer.response'

export function useContractByToken(token: Ref<string>) {
  return useQuery({
    queryKey: computed(() => [...CONTRACT_QUERY_KEYS.byToken(token.value)]),
    queryFn: async () => {
      const response = await httpClient.get<IApiContractOffer>(
        API_ROUTES.CONTRACTS.BY_TOKEN(token.value),
      )
      return toContractOffer(response.data)
    },
    enabled: computed(() => !!token.value),
  })
}
