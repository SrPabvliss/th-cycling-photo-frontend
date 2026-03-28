import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { SelectOption } from 'naive-ui'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'

export function useEventsDropdownQuery(search: Ref<string>) {
  const query = useQuery({
    queryKey: computed(() => [API_ROUTES.EVENTS.BASE, 'dropdown', search.value] as const),
    queryFn: async () => {
      const params: Record<string, unknown> = { limit: 10 }
      if (search.value) params.search = search.value
      const response = await httpClient.get<{ id: string; name: string }[]>(
        API_ROUTES.EVENTS.GET_ALL,
        { params },
      )
      return response.data.map(
        (e): SelectOption => ({
          label: e.name,
          value: e.id,
        }),
      )
    },
    staleTime: 30_000,
  })

  return {
    options: computed(() => query.data.value ?? []),
    isLoading: query.isFetching,
  }
}
