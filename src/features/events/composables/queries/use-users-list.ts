import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toUserListItems } from '../../mappers/event-operator.mapper'
import type { IApiUserListItem } from '../../types/responses/event-operator.response'

export function useOperatorUsersQuery(search: Ref<string>, enabled: Ref<boolean>) {
  return useQuery({
    queryKey: computed(() => [API_ROUTES.USERS.BASE, 'operators', search.value] as const),
    queryFn: async () => {
      const params: Record<string, unknown> = { role: 'operator', limit: 5 }
      if (search.value) params.search = search.value
      const response = await httpClient.get<IApiUserListItem[]>(API_ROUTES.USERS.GET_ALL, {
        params,
      })
      return toUserListItems(response.data)
    },
    enabled,
  })
}
