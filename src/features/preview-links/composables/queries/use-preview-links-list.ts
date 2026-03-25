import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiPagination } from '@/core/http/http-response.interface'
import { PREVIEW_LINK_QUERY_KEYS } from '../../constants/query-keys'
import { toPreviewLinkListItems } from '../../mappers/preview-link-list-item.mapper'
import type { IApiPreviewLinkListItem } from '../../types/responses/preview-link-list-item.response'

export function usePreviewLinksListQuery(eventId: Ref<string>, page: Ref<number>, limit = 20) {
  return useQuery({
    queryKey: computed(() => PREVIEW_LINK_QUERY_KEYS.byEvent(eventId.value, page.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiPreviewLinkListItem[]>(
        API_ROUTES.PREVIEW_LINKS.BY_EVENT(eventId.value),
        { params: { page: page.value, limit } },
      )

      return {
        items: toPreviewLinkListItems(response.data),
        pagination: response.meta.pagination as IApiPagination,
      }
    },
    placeholderData: keepPreviousData,
    enabled: computed(() => !!eventId.value),
  })
}
