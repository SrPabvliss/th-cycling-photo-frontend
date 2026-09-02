import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { NOTIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import { useNotificationStore } from '../../stores/notification.store'

export function useUnreadCountQuery(enabled?: Ref<boolean>) {
  const store = useNotificationStore()

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: async () => {
      const response = await httpClient.get<{ count: number }>(
        API_ROUTES.NOTIFICATIONS.UNREAD_COUNT,
      )
      // Sync Pinia store with server truth
      store.setUnreadCount(response.data.count)
      return response.data.count
    },
    staleTime: 30_000, // Fallback poll every 30s
    enabled: computed(() => enabled?.value ?? true),
  })
}
