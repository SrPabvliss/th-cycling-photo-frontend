import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { INTERNAL_IMAGE_QUERY_DEFAULTS } from '@/core/api/internal-image-query'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { toPhotoListItems } from '@/shared/mappers/photo-list.mapper'
import type { PhotoStatus } from '@/shared/types/photo-enums'
import type { IApiPhotoListItem, IPhotoListItem } from '@/shared/types/photo.types'

export function usePhotosGalleryQuery(
  eventId: Ref<string>,
  page: Ref<number>,
  status: Ref<PhotoStatus | null>,
  limit = 20,
) {
  return useQuery<{
    items: IPhotoListItem[]
    pagination: ReturnType<typeof toPagination>
  }>({
    queryKey: computed(() => [
      API_ROUTES.PHOTOS.BASE,
      'listByEvent',
      eventId.value,
      page.value,
      status.value,
      limit,
    ]),
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
