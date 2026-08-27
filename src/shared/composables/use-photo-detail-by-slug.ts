import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { INTERNAL_IMAGE_QUERY_DEFAULTS } from '@/core/api/internal-image-query'
import { httpClient } from '@/core/http/axios-client'
import { toPhotoDetail } from '@/shared/mappers/photo-detail.mapper'
import type { IApiPhotoDetail, IPhotoDetail } from '@/shared/types/photo-detail.types'

export function usePhotoDetailBySlugQuery(slug: Ref<string>) {
  return useQuery<IPhotoDetail | null>({
    queryKey: computed(() => [API_ROUTES.PHOTOS.BASE, 'detail', slug.value]),
    queryFn: async () => {
      if (!slug.value) return null
      const { data } = await httpClient.get<IApiPhotoDetail>(
        API_ROUTES.PHOTOS.DETAIL_BY_SLUG(slug.value),
      )
      return toPhotoDetail(data)
    },
    enabled: computed(() => !!slug.value),
    ...INTERNAL_IMAGE_QUERY_DEFAULTS,
  })
}
