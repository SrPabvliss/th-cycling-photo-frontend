import { watch, onUnmounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useMessage } from 'naive-ui'

import { PERMISSIONS } from '@/core/auth/permissions'
import { connectSocket, disconnectSocket, getSocket } from '@/core/socket/socket-client'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { API_ROUTES } from '@/core/api/api-routes'
import { NOTIFICATION_QUERY_KEYS } from '../constants/query-keys'
import { useNotificationStore } from '../stores/notification.store'
import type { INotificationSocketPayload } from '../types/notification.types'

const processedIds = new Set<string>()

/**
 * Connects WebSocket to backend notifications namespace.
 * Listens for events, updates Pinia badge, invalidates TanStack queries.
 * Call this once in AppLayout or App.vue.
 */
export function useNotificationSocket() {
  const authStore = useSessionStore()
  const notificationStore = useNotificationStore()
  const queryClient = useQueryClient()
  const message = useMessage()

  function handleNotification(payload: INotificationSocketPayload) {
    // Deduplicate
    if (processedIds.has(payload.id)) return
    processedIds.add(payload.id)

    // Keep set bounded
    if (processedIds.size > 200) {
      const entries = Array.from(processedIds)
      entries.slice(0, 100).forEach((id) => processedIds.delete(id))
    }

    // Refetch both list and unread-count from server. Avoid optimistic
    // incrementUnread — backend now scopes pushes per recipient, so badge
    // and list must stay in sync with the server truth.
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list() })
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount() })

    // Invalidate orders cache for order-related events
    if (payload.type.startsWith('order.')) {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.ORDERS.BASE] })
    }

    // Invalidate operator queries when relevant events arrive
    const hasDashboardRead = authStore.currentUser?.permissions?.includes(
      PERMISSIONS.DASHBOARD_OPERATOR_READ,
    )
    if (
      hasDashboardRead &&
      (payload.type === 'order.paid' || payload.type === 'order.retouch_completed')
    ) {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.OPERATOR.BASE] })
    }

    // Show toast
    message.info(payload.message, { duration: 5000 })
  }

  // Backend now scopes pushes per recipient and excludes the actor, so
  // self-action events no longer hit the user who performed them.
  const WS_EVENTS = [
    'order:created',
    'order:paid',
    'order:retouch_completed',
    'order:delivered',
    'preview:viewed',
  ] as const

  function setupListeners() {
    const socket = getSocket()
    if (!socket) return
    for (const event of WS_EVENTS) socket.on(event, handleNotification)
  }

  function cleanupListeners() {
    const socket = getSocket()
    if (!socket) return
    for (const event of WS_EVENTS) socket.off(event, handleNotification)
  }

  // Watch auth token — connect/disconnect automatically
  watch(
    () => authStore.accessToken,
    (token) => {
      if (token) {
        connectSocket(token)
        setupListeners()
      } else {
        cleanupListeners()
        disconnectSocket()
        notificationStore.resetUnread()
        processedIds.clear()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    cleanupListeners()
  })
}
