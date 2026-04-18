import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_CATEGORY_QUERY_KEYS } from '../../constants/query-keys'
import { toPhotoCategory } from '../../mappers/photo-category.mapper'
import type { IApiPhotoCategory } from '../../types/responses/photo-category.response'

export function usePhotoCategoriesQuery(eventId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => PHOTO_CATEGORY_QUERY_KEYS.byEvent(toValue(eventId))),
    queryFn: async () => {
      const { data } = await httpClient.get<IApiPhotoCategory[]>(
        API_ROUTES.PHOTO_CATEGORIES.BY_EVENT(toValue(eventId)),
      )
      return data.map(toPhotoCategory)
    },
    enabled: computed(() => !!toValue(eventId)),
  })
}
