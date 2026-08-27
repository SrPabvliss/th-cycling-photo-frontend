import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '../../constants/query-keys'
import { toGalleryFacets } from '../../mappers/gallery-facets.mapper'
import type { IApiGalleryFacets } from '../../types/responses/gallery-facets.response'

export function useGalleryFacetsQuery(eventId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => PHOTO_QUERY_KEYS.facets(eventId.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiGalleryFacets>(
        API_ROUTES.PHOTOS.GALLERY_FACETS(eventId.value),
      )
      return toGalleryFacets(response.data)
    },
    enabled: computed(() => !!eventId.value),
  })
}
