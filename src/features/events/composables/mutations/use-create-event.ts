import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { EVENT_ROUTE_NAMES } from '../../routes'
import type { ICreateEventRequest } from '../../types/requests/create-event.request'

export function useCreateEvent() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: ICreateEventRequest) =>
      httpClient.post<{ id: string }>(API_ROUTES.EVENTS.CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
      router.push({ name: EVENT_ROUTE_NAMES.LIST })
    },
  })
}
