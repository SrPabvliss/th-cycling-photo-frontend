import { useInfiniteQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, type Ref, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiPagination } from '@/core/http/http-response.interface'
import { PUBLIC_GALLERY_QUERY_KEYS } from '../../constants/query-keys'
import type { IApiPublicPhoto, IPublicPhoto } from '../../types/responses/public-photo.response'

const PHOTOS_PER_PAGE = 30

export function usePublicEventPhotosInfinite(
  eventId: MaybeRefOrGetter<string>,
  categoryId: Ref<number | null>,
) {
  return useInfiniteQuery({
    queryKey: computed(() =>
      PUBLIC_GALLERY_QUERY_KEYS.photos(toValue(eventId), undefined, categoryId.value ?? undefined),
    ),
    queryFn: async ({ pageParam }) => {
      const params: Record<string, unknown> = { page: pageParam, limit: PHOTOS_PER_PAGE }
      if (categoryId.value) params.photoCategoryId = categoryId.value

      const response = await httpClient.get<IApiPublicPhoto[]>(
        API_ROUTES.PUBLIC_EVENTS.PHOTOS(toValue(eventId)),
        { params },
      )
      const pagination = response.meta.pagination as IApiPagination
      return {
        items: response.data as IPublicPhoto[],
        pagination,
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    enabled: computed(() => !!toValue(eventId)),
  })
}
