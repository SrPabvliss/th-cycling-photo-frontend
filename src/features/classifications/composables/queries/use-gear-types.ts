import { useQuery } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiGearType, IGearType } from '../../types/equipment-item.types'

export function useGearTypesQuery(eventTypeId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: ['gear-types', eventTypeId],
    queryFn: async () => {
      const { data } = await httpClient.get<IApiGearType[]>(API_ROUTES.GEAR_TYPES.GET_ALL, {
        params: { eventTypeId: toValue(eventTypeId) },
      })
      return data as IGearType[]
    },
    staleTime: Infinity,
  })
}
