import { computed, type Ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import type { PhotoStatus } from '@/shared/types/photo-enums'
import { PHOTO_QUERY_KEYS } from '../../constants/query-keys'
import { toPhotoListItems } from '../../mappers/photo-list.mapper'
import type { IApiPhotoListItem } from '../../types/responses/photo-list.response'

export type BibMatchMode = 'exact' | 'starts' | 'contains'

export interface IPhotoSearchFilters {
  eventId: string
  plateNumber?: string | null
  bibMatch?: BibMatchMode
  status?: PhotoStatus | null
  helmetColor?: string | null
  clothingColor?: string | null
  bikeColor?: string | null
  photoCategoryId?: number | null
}

interface IPageParams {
  page: number
}

interface IPageResult {
  items: ReturnType<typeof toPhotoListItems>
  pagination: ReturnType<typeof toPagination>
}

export function usePhotosSearchInfiniteQuery(filters: Ref<IPhotoSearchFilters>, limit = 30) {
  const hasAdvancedFilters = computed(() => {
    const f = filters.value
    return !!(f.plateNumber || f.helmetColor || f.clothingColor || f.bikeColor)
  })

  return useInfiniteQuery({
    queryKey: computed(() => PHOTO_QUERY_KEYS.search({ ...filters.value, limit })),
    initialPageParam: { page: 1 } satisfies IPageParams,
    queryFn: async ({ pageParam }: { pageParam: IPageParams }): Promise<IPageResult> => {
      const f = filters.value
      const params: Record<string, unknown> = { page: pageParam.page, limit }

      if (hasAdvancedFilters.value || f.status) {
        params.eventId = f.eventId
        if (f.plateNumber) {
          params.plateNumber = f.plateNumber
          params.bibMatch = f.bibMatch ?? 'exact'
        }
        if (f.status) params.status = f.status
        if (f.helmetColor) params.helmetColor = f.helmetColor
        if (f.clothingColor) params.clothingColor = f.clothingColor
        if (f.bikeColor) params.bikeColor = f.bikeColor

        const response = await httpClient.get<IApiPhotoListItem[]>(API_ROUTES.PHOTOS.SEARCH, {
          params,
        })
        return {
          items: toPhotoListItems(response.data),
          pagination: toPagination(response.meta.pagination, {
            page: pageParam.page,
            limit,
            itemsCount: response.data.length,
          }),
        }
      }

      if (f.photoCategoryId) params.photoCategoryId = f.photoCategoryId

      const response = await httpClient.get<IApiPhotoListItem[]>(
        API_ROUTES.PHOTOS.BY_EVENT(f.eventId),
        { params },
      )
      return {
        items: toPhotoListItems(response.data),
        pagination: toPagination(response.meta.pagination, {
          page: pageParam.page,
          limit,
          itemsCount: response.data.length,
        }),
      }
    },
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? ({ page: last.pagination.page + 1 } satisfies IPageParams)
        : undefined,
    enabled: computed(() => !!filters.value.eventId),
  })
}
