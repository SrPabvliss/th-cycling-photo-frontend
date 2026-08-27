import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'

export function useUpdateEventPhotoQuota(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (quota: number | null) =>
      httpClient.patch<void>(API_ROUTES.EVENTS.PHOTO_QUOTA(id), { quota }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })
}
