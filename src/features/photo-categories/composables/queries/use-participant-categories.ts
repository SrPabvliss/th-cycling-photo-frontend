import { useQuery } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type {
  IApiParticipantCategory,
  IParticipantCategory,
} from '../../types/participant-category.types'

export function useParticipantCategoriesQuery(eventTypeId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: ['participant-categories', eventTypeId],
    queryFn: async () => {
      const { data } = await httpClient.get<IApiParticipantCategory[]>(
        API_ROUTES.PARTICIPANT_CATEGORIES.GET_ALL,
        { params: { eventTypeId: toValue(eventTypeId) } },
      )
      return data as IParticipantCategory[]
    },
    staleTime: Infinity,
  })
}
