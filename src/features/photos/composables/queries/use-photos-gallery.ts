import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiPagination } from '@/core/http/http-response.interface'
import { PHOTO_QUERY_KEYS } from '../../constants/query-keys'
import { toPhotoListItems } from '../../mappers/photo-list.mapper'
import type { PhotoStatus } from '@/shared/types/photo-enums'
import type { IApiPhotoListItem } from '../../types/responses/photo-list.response'

export function usePhotosGalleryQuery(
  eventId: Ref<string>,
  page: Ref<number>,
  status: Ref<PhotoStatus | null>,
  limit = 20,
) {
  return useQuery({
    queryKey: computed(() =>
      PHOTO_QUERY_KEYS.listByEvent(eventId.value, page.value, status.value, limit),
    ),
    queryFn: async () => {
      const hasStatusFilter = !!status.value

      const response = hasStatusFilter
        ? await httpClient.get<IApiPhotoListItem[]>(API_ROUTES.PHOTOS.SEARCH, {
            params: { eventId: eventId.value, status: status.value, page: page.value, limit },
          })
        : await httpClient.get<IApiPhotoListItem[]>(API_ROUTES.PHOTOS.BY_EVENT(eventId.value), {
            params: { page: page.value, limit },
          })

      return {
        items: toPhotoListItems(response.data),
        pagination: response.meta.pagination as IApiPagination,
      }
    },
    placeholderData: keepPreviousData,
    enabled: computed(() => !!eventId.value),
  })
}
