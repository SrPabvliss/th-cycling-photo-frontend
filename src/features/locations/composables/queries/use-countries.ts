import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCountries } from '../../mappers/country.mapper'
import type { IApiCountry } from '../../types/responses/country.response'

export function useCountriesQuery() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await httpClient.get<IApiCountry[]>(API_ROUTES.COUNTRIES.GET_ALL)
      return toCountries(response.data)
    },
    staleTime: Infinity,
  })
}
