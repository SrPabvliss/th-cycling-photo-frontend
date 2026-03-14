import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import { toCyclistListItems } from '../../mappers/cyclist-list.mapper'
import type { IApiCyclistListItem } from '../../types/responses/cyclist-list.response'

export function usePhotoCyclistsQuery(photoId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => CLASSIFICATION_QUERY_KEYS.cyclistsByPhoto(photoId.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiCyclistListItem[]>(
        API_ROUTES.PHOTOS.CYCLISTS_BY_PHOTO(photoId.value),
      )
      return toCyclistListItems(response.data)
    },
    enabled: computed(() => !!photoId.value),
  })
}
