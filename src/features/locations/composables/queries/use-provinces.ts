import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { LOCATION_QUERY_KEYS } from '../../constants/query-keys'
import { toProvinces } from '../../mappers/province.mapper'
import type { IApiProvince } from '../../types/responses/province.response'

export function useProvincesQuery() {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.provinces(),
    queryFn: async () => {
      const response = await httpClient.get<IApiProvince[]>(API_ROUTES.LOCATIONS.PROVINCES)
      return toProvinces(response.data)
    },
    staleTime: Infinity,
  })
}
