import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_CATEGORY_QUERY_KEYS } from '../../constants/query-keys'
import type { ICreatePhotoCategoryRequest } from '../../types/requests/create-photo-category.request'

export function useCreatePhotoCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ICreatePhotoCategoryRequest) =>
      httpClient.post<{ id: number }>(API_ROUTES.PHOTO_CATEGORIES.CREATE, request, {
        silent: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHOTO_CATEGORY_QUERY_KEYS.catalogAll() })
    },
  })
}
