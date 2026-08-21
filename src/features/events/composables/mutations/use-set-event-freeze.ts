import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import type { IEventDetail } from '../../types/responses/event-detail.response'

export function useSetEventFreeze(id: IEventDetail['id']) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (frozen: boolean) =>
      httpClient.patch<{ id: string }>(API_ROUTES.EVENTS.FREEZE(id), { frozen }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })
}
