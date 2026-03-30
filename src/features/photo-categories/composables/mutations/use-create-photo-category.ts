import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_CATEGORIES_GLOBAL_KEY } from '../queries/use-photo-categories-global'

export function useCreatePhotoCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) =>
      httpClient.post<{ id: string }>(
        API_ROUTES.PHOTO_CATEGORIES.CREATE,
        { name },
        { silent: true },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHOTO_CATEGORIES_GLOBAL_KEY })
    },
  })
}
