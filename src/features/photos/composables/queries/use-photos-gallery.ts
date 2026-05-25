import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { INTERNAL_IMAGE_QUERY_DEFAULTS } from '@/core/api/internal-image-query'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
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

      const items = toPhotoListItems(response.data)
      return {
        items,
        pagination: toPagination(response.meta.pagination, {
          page: page.value,
          limit,
          itemsCount: items.length,
        }),
      }
    },
    placeholderData: keepPreviousData,
    enabled: computed(() => !!eventId.value),
    ...INTERNAL_IMAGE_QUERY_DEFAULTS,
  })
}
