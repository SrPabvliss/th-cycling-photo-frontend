import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { NOTIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import { useNotificationStore } from '../../stores/notification.store'
import type { INotification } from '../../types/notification.types'

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const store = useNotificationStore()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await httpClient.patch<{ id: string }>(
        API_ROUTES.NOTIFICATIONS.MARK_AS_READ(notificationId),
      )
      return response.data
    },
    onMutate: async (notificationId) => {
      // Optimistic: update cache + decrement badge
      queryClient.setQueryData<INotification[]>(NOTIFICATION_QUERY_KEYS.list(), (old) =>
        old?.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n)),
      )
      store.decrementUnread()
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all() })
    },
  })
}
