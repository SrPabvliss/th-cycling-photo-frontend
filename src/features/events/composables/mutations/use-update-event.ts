import { toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import type { IEventDetail } from '../../types/responses/event-detail.response'
import type { IUpdateEventRequest } from '../../types/requests/update-event.request'

export function useUpdateEvent(id: MaybeRefOrGetter<IEventDetail['id']>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IUpdateEventRequest) =>
      httpClient.patch<{ id: string }>(API_ROUTES.EVENTS.UPDATE(toValue(id)), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })
}
