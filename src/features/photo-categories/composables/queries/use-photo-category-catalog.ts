import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_CATEGORY_QUERY_KEYS } from '../../constants/query-keys'
import { toPhotoCategory } from '../../mappers/photo-category.mapper'
import type { IApiPhotoCategory } from '../../types/responses/photo-category.response'

/**
 * Categories the user can pick: base ones plus the organizer's own, base first.
 * With an event, the organizer is the event's owner (so the admin sees theirs);
 * without one (creation wizard), it is the user's own tenant.
 */
export function usePhotoCategoryCatalogQuery(
  eventId?: MaybeRefOrGetter<string | null | undefined>,
) {
  const id = computed(() => toValue(eventId) || null)

  return useQuery({
    queryKey: computed(() => PHOTO_CATEGORY_QUERY_KEYS.catalog(id.value)),
    queryFn: async () => {
      const { data } = await httpClient.get<IApiPhotoCategory[]>(
        API_ROUTES.PHOTO_CATEGORIES.GET_ALL,
        { params: id.value ? { eventId: id.value } : undefined },
      )
      return data.map(toPhotoCategory)
    },
  })
}
