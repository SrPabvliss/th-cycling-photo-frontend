import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import { toCyclistDetail } from '../../mappers/cyclist-detail.mapper'
import type { IApiCyclistDetail } from '../../types/responses/cyclist-detail.response'

export function useCyclistDetailQuery(cyclistId: Ref<string | null>) {
  return useQuery({
    queryKey: computed(() => CLASSIFICATION_QUERY_KEYS.cyclistDetail(cyclistId.value!)),
    queryFn: async () => {
      const response = await httpClient.get<IApiCyclistDetail>(
        API_ROUTES.CLASSIFICATIONS.CYCLIST_DETAIL(cyclistId.value!),
      )
      return toCyclistDetail(response.data)
    },
    enabled: computed(() => !!cyclistId.value),
  })
}
