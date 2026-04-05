import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toProvinces } from '../../mappers/province.mapper'
import type { IApiProvince } from '../../types/responses/province.response'

export function useProvincesByCountryQuery(countryId: Ref<number | null>) {
  return useQuery({
    queryKey: computed(() => ['countries', countryId.value, 'provinces']),
    queryFn: async () => {
      const response = await httpClient.get<IApiProvince[]>(
        API_ROUTES.COUNTRIES.PROVINCES(countryId.value!),
      )
      return toProvinces(response.data)
    },
    enabled: computed(() => countryId.value !== null),
    staleTime: Infinity,
  })
}
