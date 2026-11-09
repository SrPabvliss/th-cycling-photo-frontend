import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_CATEGORY_QUERY_KEYS } from '../../constants/query-keys'
import type { IBulkAssignCategoryRequest } from '../../types/requests/bulk-assign-category.request'

export function useBulkAssignCategory(eventId: Ref<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: IBulkAssignCategoryRequest) =>
      httpClient.patch(API_ROUTES.PHOTOS.BULK_CATEGORY, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PHOTO_CATEGORY_QUERY_KEYS.byEvent(eventId.value),
      })
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PHOTOS.BASE] })
    },
  })
}
