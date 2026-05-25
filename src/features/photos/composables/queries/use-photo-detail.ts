import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { INTERNAL_IMAGE_QUERY_DEFAULTS } from '@/core/api/internal-image-query'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '../../constants/query-keys'
import { toPhotoDetail } from '../../mappers/photo-detail.mapper'
import type { IApiPhotoDetail } from '../../types/responses/photo-detail.response'

export function usePhotoDetailQuery(id: Ref<string>) {
  return useQuery({
    queryKey: computed(() => PHOTO_QUERY_KEYS.detail(id.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiPhotoDetail>(API_ROUTES.PHOTOS.DETAIL(id.value))
      return toPhotoDetail(response.data)
    },
    enabled: computed(() => !!id.value),
    ...INTERNAL_IMAGE_QUERY_DEFAULTS,
  })
}
