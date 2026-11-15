import { keepPreviousData, useInfiniteQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, type Ref, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { PUBLIC_GALLERY_QUERY_KEYS } from '../../constants/query-keys'
import type { IApiPublicPhoto, IPublicPhoto } from '../../types/responses/public-photo.response'

const PHOTOS_PER_PAGE = 30

async function fetchPhotos(slug: string, page: number, filters: Record<string, unknown>) {
  const response = await httpClient.get<IApiPublicPhoto[]>(API_ROUTES.PUBLIC_EVENTS.PHOTOS(slug), {
    params: { page, limit: PHOTOS_PER_PAGE, ...filters },
    silent: true,
  })
  const items = response.data as IPublicPhoto[]

  return {
    items,
    pagination: toPagination(response.meta.pagination, {
      page,
      limit: PHOTOS_PER_PAGE,
      itemsCount: items.length,
    }),
  }
}

type IPhotosPage = Awaited<ReturnType<typeof fetchPhotos>>

const nextPageOf = (last: IPhotosPage) =>
  last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined

/**
 * Photos of a public event, page by page. With a plate, only the photos where that exact plate
 * was read: a rider's plate is a whole number, and "12" must not bring "127". Without one, every
 * photo. While another plate or category loads, the previous photos stay. Silent: the gallery
 * shows the failure in place.
 */
export function usePublicEventPhotosInfinite(
  slug: MaybeRefOrGetter<string>,
  categoryId: Ref<number | null>,
  plate: Ref<string | null>,
) {
  return useInfiniteQuery({
    queryKey: computed(() =>
      PUBLIC_GALLERY_QUERY_KEYS.photos(toValue(slug), categoryId.value, plate.value, 'matched'),
    ),
    queryFn: ({ pageParam }) =>
      fetchPhotos(toValue(slug), pageParam, {
        ...(categoryId.value ? { photoCategoryId: categoryId.value } : {}),
        ...(plate.value ? { bibNumber: plate.value, bibMatch: 'exact' } : {}),
      }),
    initialPageParam: 1,
    getNextPageParam: nextPageOf,
    enabled: computed(() => !!toValue(slug)),
    placeholderData: keepPreviousData,
  })
}

/**
 * Companion of a plate search: the photos of the event where no plate could be read, for the
 * rider the recognition missed. Only asked for while a plate is being searched, and paged on its
 * own.
 */
export function usePublicEventNoBibPhotosInfinite(
  slug: MaybeRefOrGetter<string>,
  categoryId: Ref<number | null>,
  plate: Ref<string | null>,
) {
  return useInfiniteQuery({
    queryKey: computed(() =>
      PUBLIC_GALLERY_QUERY_KEYS.photos(toValue(slug), categoryId.value, null, 'no_bib'),
    ),
    queryFn: ({ pageParam }) =>
      fetchPhotos(toValue(slug), pageParam, {
        section: 'no_bib',
        ...(categoryId.value ? { photoCategoryId: categoryId.value } : {}),
      }),
    initialPageParam: 1,
    getNextPageParam: nextPageOf,
    enabled: computed(() => !!toValue(slug) && !!plate.value),
  })
}
