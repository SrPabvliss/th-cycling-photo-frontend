import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'

interface SetFeaturedParams {
  eventId: string
  isFeatured: boolean
}

export function useSetFeatured() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, isFeatured }: SetFeaturedParams) =>
      httpClient.patch(API_ROUTES.EVENTS.FEATURED(eventId), { isFeatured }, { silent: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })
}
