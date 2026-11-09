import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { BUYER_QUERY_KEYS } from '../../constants/query-keys'
import { toBuyerDetail } from '../../mappers/buyer-detail.mapper'
import type { IApiBuyerDetail } from '../../types/responses/buyer-detail.response'

export function useBuyerDetailQuery(id: Ref<string>) {
  return useQuery({
    queryKey: computed(() => BUYER_QUERY_KEYS.detail(id.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiBuyerDetail>(API_ROUTES.BUYERS.GET_BY_ID(id.value))
      return toBuyerDetail(response.data)
    },
    enabled: computed(() => !!id.value),
  })
}
