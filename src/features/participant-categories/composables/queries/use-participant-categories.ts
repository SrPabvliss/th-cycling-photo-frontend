import { type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PARTICIPANT_CATEGORY_QUERY_KEYS } from '../../constants/query-keys'
import { toParticipantCategories } from '../../mappers/participant-category.mapper'
import type { IApiParticipantCategory } from '../../types/responses/participant-category.response'

export function useParticipantCategoriesQuery(eventTypeId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...PARTICIPANT_CATEGORY_QUERY_KEYS.byEventType(toValue(eventTypeId))],
    queryFn: async () => {
      const { data } = await httpClient.get<IApiParticipantCategory[]>(
        API_ROUTES.PARTICIPANT_CATEGORIES.GET_ALL,
        { params: { eventTypeId: toValue(eventTypeId) } },
      )
      return toParticipantCategories(data)
    },
    staleTime: Infinity,
  })
}
