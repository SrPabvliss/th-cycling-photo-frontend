import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '../../constants/query-keys'
import type { PhotoStatus } from '../../types/responses/photo-list.response'
import type { IApiPhotoView, IPhotoView } from '../../types/responses/photo-view.response'

export function usePhotoViewQuery(slug: Ref<string>) {
  return useQuery({
    queryKey: computed(() => [...PHOTO_QUERY_KEYS.all(), 'view', slug.value]),
    queryFn: async () => {
      const { data } = await httpClient.get<IApiPhotoView>(API_ROUTES.PHOTOS.VIEW(slug.value))
      return {
        ...data,
        status: data.status as PhotoStatus,
        uploadedAt: new Date(data.uploadedAt),
        processedAt: data.processedAt ? new Date(data.processedAt) : null,
      } satisfies IPhotoView
    },
    enabled: computed(() => !!slug.value),
  })
}
