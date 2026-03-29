<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import type { INotification, NotificationType } from '../../../types/notification.types'
import { NOTIFICATION_CONFIG } from '../../../constants/notification-config'

const props = defineProps<{
  notification: INotification
}>()

defineEmits<{
  click: [notification: INotification]
}>()

const config = computed(() => NOTIFICATION_CONFIG[props.notification.type as NotificationType])
</script>

<template>
  <div
    :class="['ni', { 'ni--unread': !notification.isRead }]"
    @click="$emit('click', notification)"
  >
    <div class="ni__icon" :style="{ background: config?.color + '15', color: config?.color }">
      <NIcon :component="config?.icon" :size="16" />
    </div>
    <div class="ni__content">
      <p class="ni__message">{{ notification.message }}</p>
      <span class="ni__time">{{ formatRelativeTime(notification.createdAt) }}</span>
    </div>
    <div v-if="!notification.isRead" class="ni__dot" />
  </div>
</template>

<style scoped src="./notification-item.css" />
