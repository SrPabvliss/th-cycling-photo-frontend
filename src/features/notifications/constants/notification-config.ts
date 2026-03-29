import { EyeOutline, CartOutline, CheckmarkCircleOutline, SendOutline } from '@vicons/ionicons5'
import type { Component } from 'vue'

import { NOTIFICATION_TYPE, type NotificationType } from '../types/notification.types'

export interface INotificationConfig {
  icon: Component
  color: string
  getRoute: (data: Record<string, unknown>) => string | null
}

export const NOTIFICATION_CONFIG: Record<NotificationType, INotificationConfig> = {
  [NOTIFICATION_TYPE.PREVIEW_VIEWED]: {
    icon: EyeOutline,
    color: '#2080f0',
    getRoute: () => null,
  },
  [NOTIFICATION_TYPE.ORDER_CREATED]: {
    icon: CartOutline,
    color: '#f0a020',
    getRoute: (data) => (data.orderId ? `/orders/${data.orderId}` : null),
  },
  [NOTIFICATION_TYPE.ORDER_PAID]: {
    icon: CheckmarkCircleOutline,
    color: '#18a058',
    getRoute: (data) => (data.orderId ? `/orders/${data.orderId}` : null),
  },
  [NOTIFICATION_TYPE.ORDER_DELIVERED]: {
    icon: SendOutline,
    color: '#105080',
    getRoute: (data) => (data.orderId ? `/orders/${data.orderId}` : null),
  },
}
