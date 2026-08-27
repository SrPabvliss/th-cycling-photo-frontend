import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPickablePeople } from '../../mappers/pickable-person.mapper'
import type { IApiPickablePerson } from '../../types/responses/pickable-person.response'

const MIN_SEARCH_LENGTH = 2
const RESULTS_LIMIT = 8

export function useSearchUsersQuery(search: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ['organizers', 'person-picker', 'search', search.value] as const),
    queryFn: async () => {
      const response = await httpClient.get<IApiPickablePerson[]>(API_ROUTES.USERS.GET_ALL, {
        params: { search: search.value, limit: RESULTS_LIMIT },
      })
      return toPickablePeople(response.data)
    },
    enabled: computed(() => search.value.trim().length >= MIN_SEARCH_LENGTH),
  })
}
