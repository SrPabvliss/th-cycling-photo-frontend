import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_ASSET_QUERY_KEYS } from '../../constants/query-keys'
import { toEventAsset } from '../../mappers/event-asset.mapper'
import type { IApiEventAsset } from '../../types/responses/event-asset.response'

export function useEventAssetsQuery(eventId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => EVENT_ASSET_QUERY_KEYS.byEvent(toValue(eventId))),
    queryFn: async () => {
      const { data } = await httpClient.get<IApiEventAsset[]>(
        API_ROUTES.EVENTS.ASSETS.GET_ALL(toValue(eventId)),
      )
      return data.map(toEventAsset)
    },
  })
}
