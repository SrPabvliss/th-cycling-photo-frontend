import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toEventDetail } from '@/shared/mappers/event-detail.mapper'
import type { IApiEventDetail, IEventDetail } from '@/shared/types/event.types'

export function useEventDetailQuery(slug: Ref<string>) {
  return useQuery<IEventDetail>({
    queryKey: computed(() => [API_ROUTES.EVENTS.BASE, 'detail', slug.value]),
    queryFn: async () => {
      const response = await httpClient.get<IApiEventDetail>(
        API_ROUTES.EVENTS.GET_BY_ID(slug.value),
      )
      return toEventDetail(response.data)
    },
    enabled: computed(() => !!slug.value),
  })
}
