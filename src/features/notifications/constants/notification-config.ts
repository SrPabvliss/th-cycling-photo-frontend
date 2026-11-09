import {
  EyeOutline,
  CartOutline,
  CheckmarkCircleOutline,
  SendOutline,
  BrushOutline,
} from '@vicons/ionicons5'
import type { Component } from 'vue'

import { PERMISSIONS } from '@/core/auth/permissions'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { NOTIFICATION_TYPE, type NotificationType } from '../types/notification.types'

export interface INotificationConfig {
  icon: Component
  color: string
  // Null when the principal has nowhere meaningful to land.
  getRoute: (data: Record<string, unknown>, permissions: string[]) => string | null
}

// The detail is a panel over the list, not its own route: `/orders/:id` is a 404.
function adminOrderDetail(data: Record<string, unknown>): string | null {
  return data.orderId ? `${ROUTE_PATHS.ORDERS}?order=${data.orderId}` : null
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
    getRoute: (data, permissions) =>
      permissions.includes(PERMISSIONS.ORDER_READ) ? adminOrderDetail(data) : null,
  },
  [NOTIFICATION_TYPE.ORDER_PAID]: {
    icon: CheckmarkCircleOutline,
    color: '#18a058',
    getRoute: (data, permissions) => {
      if (permissions.includes(PERMISSIONS.ORDER_READ)) return adminOrderDetail(data)
      if (permissions.includes(PERMISSIONS.PHOTO_RETOUCH_READ)) return '/operator'
      return null
    },
  },
  [NOTIFICATION_TYPE.ORDER_DELIVERED]: {
    icon: SendOutline,
    color: '#105080',
    getRoute: (data, permissions) =>
      permissions.includes(PERMISSIONS.ORDER_READ) ? adminOrderDetail(data) : null,
  },
  [NOTIFICATION_TYPE.ORDER_RETOUCH_COMPLETED]: {
    icon: BrushOutline,
    color: '#8b5cf6',
    getRoute: (data, permissions) =>
      permissions.includes(PERMISSIONS.ORDER_READ) ? adminOrderDetail(data) : null,
  },
}
