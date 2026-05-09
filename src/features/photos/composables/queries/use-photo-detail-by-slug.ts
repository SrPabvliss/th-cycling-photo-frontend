import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '../../constants/query-keys'
import { toPhotoDetail } from '../../mappers/photo-detail.mapper'
import type { IApiPhotoDetail } from '../../types/responses/photo-detail.response'

export function usePhotoDetailBySlugQuery(slug: Ref<string>) {
  return useQuery({
    queryKey: computed(() => [...PHOTO_QUERY_KEYS.detailBySlug(slug.value)]),
    queryFn: async () => {
      const { data } = await httpClient.get<IApiPhotoDetail>(
        API_ROUTES.PHOTOS.DETAIL_BY_SLUG(slug.value),
      )
      return toPhotoDetail(data)
    },
    enabled: computed(() => !!slug.value),
  })
}
