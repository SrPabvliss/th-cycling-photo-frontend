<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NSpin } from 'naive-ui'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { useNotificationsListQuery } from '../../../composables/queries/use-notifications-list'
import { useMarkAsRead } from '../../../composables/mutations/use-mark-as-read'
import { useMarkAllRead } from '../../../composables/mutations/use-mark-all-read'
import { useNotificationStore } from '../../../stores/notification.store'
import { NOTIFICATION_CONFIG } from '../../../constants/notification-config'
import type { INotification, NotificationType } from '../../../types/notification.types'
import NotificationItem from '../NotificationItem/NotificationItem.vue'

const router = useRouter()
const store = useNotificationStore()
const authStore = useSessionStore()
const { data: notifications, isPending } = useNotificationsListQuery()
const { mutate: markAsRead } = useMarkAsRead()
const { mutate: markAllRead } = useMarkAllRead()

function handleClick(notification: INotification) {
  if (!notification.isRead) {
    markAsRead(notification.id)
  }

  const config = NOTIFICATION_CONFIG[notification.type as NotificationType]
  const permissions = authStore.currentUser?.permissions ?? []
  const route = config?.getRoute(notification.data, permissions)
  if (route) {
    router.push(route)
  }
}
</script>

<template>
  <div class="nd">
    <div class="nd__header">
      <span class="nd__title">Notificaciones</span>
      <NButton v-if="store.unreadCount > 0" text type="primary" size="tiny" @click="markAllRead()">
        Marcar todas leídas
      </NButton>
    </div>

    <div class="nd__body">
      <div v-if="isPending" class="nd__loading">
        <NSpin size="small" />
      </div>

      <div v-else-if="!notifications || notifications.length === 0" class="nd__empty">
        Sin notificaciones
      </div>

      <template v-else>
        <NotificationItem
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @click="handleClick"
        />
      </template>
    </div>
  </div>
</template>

<style scoped src="./notification-dropdown.css" />
