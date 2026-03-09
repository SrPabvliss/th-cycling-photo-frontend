import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { LOCATION_QUERY_KEYS } from '../../constants/query-keys'
import { toCantons } from '../../mappers/canton.mapper'
import type { IApiCanton } from '../../types/responses/canton.response'

export function useCantonsQuery(provinceId: Ref<number | null>) {
  return useQuery({
    queryKey: computed(() => LOCATION_QUERY_KEYS.cantons(provinceId.value!)),
    queryFn: async () => {
      const response = await httpClient.get<IApiCanton[]>(
        API_ROUTES.LOCATIONS.CANTONS_BY_PROVINCE(provinceId.value!),
      )
      return toCantons(response.data)
    },
    enabled: computed(() => provinceId.value !== null),
    staleTime: Infinity,
  })
}
