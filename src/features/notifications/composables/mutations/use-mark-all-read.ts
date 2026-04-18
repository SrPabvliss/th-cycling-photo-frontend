import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { NOTIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import { useNotificationStore } from '../../stores/notification.store'
import type { INotification } from '../../types/notification.types'

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  const store = useNotificationStore()

  return useMutation({
    mutationFn: async () => {
      const response = await httpClient.patch<{ updated: number }>(
        API_ROUTES.NOTIFICATIONS.MARK_ALL_READ,
      )
      return response.data
    },
    onMutate: async () => {
      queryClient.setQueryData<INotification[]>(NOTIFICATION_QUERY_KEYS.list(), (old) =>
        old?.map((n) => ({ ...n, isRead: true, readAt: new Date() })),
      )
      store.resetUnread()
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all() })
    },
  })
}
