import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiPagination } from '@/core/http/http-response.interface'
import type { PhotoStatus } from '@/shared/types/photo-enums'
import { PHOTO_QUERY_KEYS } from '../../constants/query-keys'
import { toPhotoListItems } from '../../mappers/photo-list.mapper'
import type { IApiPhotoListItem } from '../../types/responses/photo-list.response'

export interface IPhotoSearchFilters {
  eventId: string
  plateNumber?: number | null
  status?: PhotoStatus | null
  helmetColor?: string | null
  clothingColor?: string | null
  bikeColor?: string | null
  photoCategoryId?: number | null
}

export function usePhotosSearchQuery(
  filters: Ref<IPhotoSearchFilters>,
  page: Ref<number>,
  limit = 20,
) {
  const hasAdvancedFilters = computed(() => {
    const f = filters.value
    return !!(f.plateNumber || f.helmetColor || f.clothingColor || f.bikeColor)
  })

  return useQuery({
    queryKey: computed(() =>
      PHOTO_QUERY_KEYS.search({
        ...filters.value,
        page: page.value,
        limit,
      }),
    ),
    queryFn: async () => {
      const f = filters.value
      const params: Record<string, unknown> = {
        page: page.value,
        limit,
      }

      // Use /photos/search when advanced classification filters are active
      if (hasAdvancedFilters.value || f.status) {
        params.eventId = f.eventId
        if (f.plateNumber) params.plateNumber = f.plateNumber
        if (f.status) params.status = f.status
        if (f.helmetColor) params.helmetColor = f.helmetColor
        if (f.clothingColor) params.clothingColor = f.clothingColor
        if (f.bikeColor) params.bikeColor = f.bikeColor

        const response = await httpClient.get<IApiPhotoListItem[]>(API_ROUTES.PHOTOS.SEARCH, {
          params,
        })
        return {
          items: toPhotoListItems(response.data),
          pagination: response.meta.pagination as IApiPagination,
        }
      }

      // Default: event-scoped listing (supports photoCategoryId filter)
      if (f.photoCategoryId) params.photoCategoryId = f.photoCategoryId

      const response = await httpClient.get<IApiPhotoListItem[]>(
        API_ROUTES.PHOTOS.BY_EVENT(f.eventId),
        { params },
      )
      return {
        items: toPhotoListItems(response.data),
        pagination: response.meta.pagination as IApiPagination,
      }
    },
    placeholderData: keepPreviousData,
    enabled: computed(() => !!filters.value.eventId),
  })
}
