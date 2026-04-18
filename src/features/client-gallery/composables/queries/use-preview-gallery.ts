import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLIENT_GALLERY_QUERY_KEYS } from '../../constants/query-keys'
import { toPreviewData } from '../../mappers/preview-data.mapper'
import type { IApiPreviewData } from '../../types/responses/preview-data.response'

export function usePreviewGallery(token: Ref<string>) {
  const query = useQuery({
    queryKey: computed(() => CLIENT_GALLERY_QUERY_KEYS.preview(token.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiPreviewData>(
        API_ROUTES.PREVIEW_PUBLIC.GET_BY_TOKEN(token.value),
        { silent: true },
      )
      return toPreviewData(response.data)
    },
    enabled: computed(() => !!token.value),
    retry: false,
  })

  const isExpired = computed(() => {
    if (!query.error.value) return false
    const err = query.error.value as { response?: { status?: number } }
    return err.response?.status === 410
  })

  const isNotFound = computed(() => {
    if (!query.error.value) return false
    const err = query.error.value as { response?: { status?: number } }
    return err.response?.status === 404
  })

  const isConverted = computed(() => query.data.value?.status === 'converted')

  return {
    ...query,
    isExpired,
    isNotFound,
    isConverted,
  }
}
