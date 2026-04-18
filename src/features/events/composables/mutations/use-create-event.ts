import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import type { ICreateEventRequest } from '../../types/requests/create-event.request'

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ICreateEventRequest) => {
      const response = await httpClient.post<{ id: string }>(API_ROUTES.EVENTS.CREATE, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })
}
