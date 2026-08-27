import { computed, type Ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { INTERNAL_IMAGE_QUERY_DEFAULTS } from '@/core/api/internal-image-query'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { PHOTO_QUERY_KEYS } from '../../constants/query-keys'
import { toPhotoListItems } from '../../mappers/photo-list.mapper'
import type { IApiPhotoListItem } from '../../types/responses/photo-list.response'
import type { IGalleryFilterState } from '../../types/gallery-filters.types'

interface IPageParams {
  page: number
}

interface IPageResult {
  items: ReturnType<typeof toPhotoListItems>
  pagination: ReturnType<typeof toPagination>
}

export function useGalleryPhotosInfiniteQuery(filters: Ref<IGalleryFilterState>, limit = 30) {
  return useInfiniteQuery({
    queryKey: computed(() => PHOTO_QUERY_KEYS.gallery({ ...filters.value, limit })),
    initialPageParam: { page: 1 } satisfies IPageParams,
    queryFn: async ({ pageParam }: { pageParam: IPageParams }): Promise<IPageResult> => {
      const f = filters.value
      const params: Record<string, unknown> = { page: pageParam.page, limit, sort: f.sort }
      if (f.bib) params.bib = f.bib
      if (f.uncategorized) params.uncategorized = true
      else if (f.photoCategoryId) params.photoCategoryId = f.photoCategoryId
      if (f.sale) params.sale = f.sale
      if (f.plateNumber) {
        params.plateNumber = f.plateNumber
        params.bibMatch = f.bibMatch
      }

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
    ...INTERNAL_IMAGE_QUERY_DEFAULTS,
  })
}
