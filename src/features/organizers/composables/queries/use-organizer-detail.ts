import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORGANIZER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrganizerDetail } from '../../mappers/organizer-detail.mapper'
import type { IApiOrganizerDetail } from '../../types/responses/organizer-detail.response'

export function useOrganizerDetailQuery(id: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ORGANIZER_QUERY_KEYS.detail(id.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiOrganizerDetail>(
        API_ROUTES.ORGANIZERS.GET_BY_ID(id.value),
      )
      return toOrganizerDetail(response.data)
    },
    enabled: computed(() => !!id.value),
  })
}
