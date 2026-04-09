import { watch, onUnmounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useMessage } from 'naive-ui'

import { USER_ROLES } from '@/core/auth/user-roles'
import { connectSocket, disconnectSocket, getSocket } from '@/core/socket/socket-client'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { OPERATOR_QUERY_KEYS } from '@/features/operator/constants/query-keys'
import { ORDER_QUERY_KEYS } from '@/features/orders/constants/query-keys'
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
  const authStore = useAuthStore()
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

    // Update badge instantly
    notificationStore.incrementUnread()

    // Invalidate notification list cache
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list() })

    // Invalidate orders cache for order-related events
    if (payload.type.startsWith('order.')) {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all() })
    }

    // Invalidate operator queries when relevant events arrive
    const role = authStore.currentUser?.role
    if (
      role === USER_ROLES.OPERATOR &&
      (payload.type === 'order.paid' || payload.type === 'order.retouch_completed')
    ) {
      queryClient.invalidateQueries({ queryKey: OPERATOR_QUERY_KEYS.all() })
    }

    // Show toast
    message.info(payload.message, { duration: 5000 })
  }

  // Active WebSocket events — only listen for events that need real-time push.
  // Enable additional events when multi-admin support is needed:
  //   'preview:viewed'  → someone viewed a preview link
  //   'order:paid'      → admin confirmed payment (self-action, not useful for single admin)
  //   'order:delivered'  → admin sent delivery (self-action, not useful for single admin)
  const WS_EVENTS = [
    'order:created',
    'order:paid',
    'order:retouch_completed',
    // 'preview:viewed',
    // 'order:delivered',
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
