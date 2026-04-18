import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiSimilarPhoto } from '../../types/responses/similar-photo.response'
import { toSimilarPhotos } from '../../mappers/similar-photo.mapper'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'

export function useSimilarPhotosQuery(photoId: Ref<string>, enabled?: Ref<boolean>) {
  return useQuery({
    queryKey: computed(() => CLASSIFICATION_QUERY_KEYS.similarPhotos(photoId.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiSimilarPhoto[]>(
        API_ROUTES.PHOTOS.SIMILAR(photoId.value),
        { params: { limit: 10 } },
      )
      return toSimilarPhotos(response.data)
    },
    enabled: computed(() => {
      if (enabled && !enabled.value) return false
      return !!photoId.value
    }),
    staleTime: 5 * 60 * 1000,
  })
}
