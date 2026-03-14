import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiPagination } from '@/core/http/http-response.interface'
import { toPhotoListItems } from '@/features/photos/mappers/photo-list.mapper'
import type { IApiPhotoListItem } from '@/features/photos/types/responses/photo-list.response'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'

export const WORKSPACE_LIMIT = 50

export function useWorkspacePhotosQuery(
  eventId: Ref<string>,
  page: Ref<number>,
  classified?: Ref<boolean | undefined>,
) {
  return useQuery({
    queryKey: computed(() =>
      CLASSIFICATION_QUERY_KEYS.workspacePhotos(eventId.value, page.value, classified?.value),
    ),
    queryFn: async () => {
      const params: Record<string, unknown> = { page: page.value, limit: WORKSPACE_LIMIT }
      if (classified?.value !== undefined) {
        params.classified = classified.value
      }
      const response = await httpClient.get<IApiPhotoListItem[]>(
        API_ROUTES.PHOTOS.BY_EVENT(eventId.value),
        { params },
      )
      return {
        items: toPhotoListItems(response.data),
        pagination: response.meta.pagination as IApiPagination,
      }
    },
    placeholderData: keepPreviousData,
    enabled: computed(() => !!eventId.value),
  })
}
