import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { EVENT_ROUTE_NAMES } from '../../routes'
import type { IEventDetail } from '../../types/responses/event-detail.response'
import type { IUpdateEventRequest } from '../../types/requests/update-event.request'

export function useUpdateEvent(id: IEventDetail['id'], slug: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: IUpdateEventRequest) =>
      httpClient.patch<{ id: string }>(API_ROUTES.EVENTS.UPDATE(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
      router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { slug } })
    },
  })
}
