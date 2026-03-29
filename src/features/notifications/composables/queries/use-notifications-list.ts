import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { NOTIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import { toNotifications } from '../../mappers/notification.mapper'
import type { IApiNotification } from '../../types/notification.types'

export function useNotificationsListQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(),
    queryFn: async () => {
      const response = await httpClient.get<IApiNotification[]>(API_ROUTES.NOTIFICATIONS.GET_ALL, {
        params: { limit: 30 },
      })
      return toNotifications(response.data)
    },
    staleTime: Infinity, // WebSocket keeps us fresh
  })
}
