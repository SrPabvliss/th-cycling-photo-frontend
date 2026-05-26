import { useInfiniteQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, type Ref, toValue } from 'vue'
import { refDebounced } from '@vueuse/core'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { PUBLIC_GALLERY_QUERY_KEYS } from '../../constants/query-keys'
import type { IApiPublicPhoto, IPublicPhoto } from '../../types/responses/public-photo.response'

const PHOTOS_PER_PAGE = 30

/**
 * Paginated photos for the public gallery. When `bibNumber` is set the
 * backend returns only the photos that match the bib (the "matched"
 * section). The companion "no_bib" section is paginated separately via
 * `usePublicEventNoBibPhotosInfinite` so each block can grow on its own
 * scroll sentinel.
 */
export function usePublicEventPhotosInfinite(
  slug: MaybeRefOrGetter<string>,
  categoryId: Ref<number | null>,
  bibNumber: Ref<string>,
  bibMatch: Ref<'exact' | 'starts' | 'contains'>,
) {
  const debouncedBib = refDebounced(bibNumber, 300)

  return useInfiniteQuery({
    queryKey: computed(() =>
      PUBLIC_GALLERY_QUERY_KEYS.photos(
        toValue(slug),
        undefined,
        categoryId.value ?? undefined,
        debouncedBib.value || undefined,
        bibMatch.value,
      ),
    ),
    queryFn: async ({ pageParam }) => {
      const params: Record<string, unknown> = { page: pageParam, limit: PHOTOS_PER_PAGE }
      if (categoryId.value) params.photoCategoryId = categoryId.value
      if (debouncedBib.value) {
        params.bibNumber = debouncedBib.value
        params.bibMatch = bibMatch.value
      }

      const response = await httpClient.get<IApiPublicPhoto[]>(
        API_ROUTES.PUBLIC_EVENTS.PHOTOS(toValue(slug)),
        { params },
      )
      const items = response.data as IPublicPhoto[]
      return {
        items,
        pagination: toPagination(response.meta.pagination, {
          page: pageParam as number,
          limit: PHOTOS_PER_PAGE,
          itemsCount: items.length,
        }),
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    enabled: computed(() => !!toValue(slug)),
  })
}

/**
 * Paginated companion stream for the public gallery search: photos in
 * the same event that have no detected bib. Enabled only when the user
 * is actively searching by bib number, so the additional request only
 * fires when the rider explicitly asks for it.
 */
export function usePublicEventNoBibPhotosInfinite(
  slug: MaybeRefOrGetter<string>,
  categoryId: Ref<number | null>,
  bibNumber: Ref<string>,
) {
  const debouncedBib = refDebounced(bibNumber, 300)

  return useInfiniteQuery({
    queryKey: computed(() =>
      PUBLIC_GALLERY_QUERY_KEYS.photos(
        toValue(slug),
        undefined,
        categoryId.value ?? undefined,
        undefined,
        undefined,
        'no_bib',
      ),
    ),
    queryFn: async ({ pageParam }) => {
      const params: Record<string, unknown> = {
        page: pageParam,
        limit: PHOTOS_PER_PAGE,
        section: 'no_bib',
      }
      if (categoryId.value) params.photoCategoryId = categoryId.value

      const response = await httpClient.get<IApiPublicPhoto[]>(
        API_ROUTES.PUBLIC_EVENTS.PHOTOS(toValue(slug)),
        { params },
      )
      const items = response.data as IPublicPhoto[]
      return {
        items,
        pagination: toPagination(response.meta.pagination, {
          page: pageParam as number,
          limit: PHOTOS_PER_PAGE,
          itemsCount: items.length,
        }),
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    enabled: computed(() => !!toValue(slug) && !!debouncedBib.value.trim()),
  })
}
