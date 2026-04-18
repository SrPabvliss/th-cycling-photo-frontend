<script setup lang="ts">
import { NIcon, NPopover, NBadge } from 'naive-ui'
import { NotificationsOutline } from '@vicons/ionicons5'

import { useNotificationStore } from '../../../stores/notification.store'
import { useUnreadCountQuery } from '../../../composables/queries/use-unread-count'
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown.vue'

const store = useNotificationStore()

useUnreadCountQuery()
</script>

<template>
  <NPopover trigger="click" placement="bottom-end" :show-arrow="false" raw>
    <template #trigger>
      <button class="bell-btn">
        <NBadge :value="store.unreadCount" :max="99" :show="store.unreadCount > 0">
          <NIcon :component="NotificationsOutline" :size="20" />
        </NBadge>
      </button>
    </template>
    <NotificationDropdown />
  </NPopover>
</template>

<style scoped>
.bell-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.bell-btn:hover {
  background: #f3f4f6;
  color: #1a1f2c;
}
</style>
