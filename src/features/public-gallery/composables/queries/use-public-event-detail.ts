import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PUBLIC_GALLERY_QUERY_KEYS } from '../../constants/query-keys'
import { toPublicEventDetail } from '../../mappers/public-event.mapper'
import type { IApiPublicEventDetail } from '../../types/responses/public-event-detail.response'

export function usePublicEventDetailQuery(slug: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => PUBLIC_GALLERY_QUERY_KEYS.eventDetail(toValue(slug))),
    queryFn: async () => {
      const { data } = await httpClient.get<IApiPublicEventDetail>(
        API_ROUTES.PUBLIC_EVENTS.GET_BY_SLUG(toValue(slug)),
      )
      return toPublicEventDetail(data)
    },
  })
}
