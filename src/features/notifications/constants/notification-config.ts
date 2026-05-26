import {
  EyeOutline,
  CartOutline,
  CheckmarkCircleOutline,
  SendOutline,
  BrushOutline,
} from '@vicons/ionicons5'
import type { Component } from 'vue'

import { USER_ROLES, type UserRole } from '@/core/auth/user-roles'
import { NOTIFICATION_TYPE, type NotificationType } from '../types/notification.types'

export interface INotificationConfig {
  icon: Component
  color: string
  // Returns the destination route or `null` when the current role has no
  // meaningful place to land. Operators do not have access to the admin
  // /orders/:id detail; routing them there triggered the 403 screen.
  getRoute: (data: Record<string, unknown>, role: UserRole | undefined) => string | null
}

function adminOrderDetail(data: Record<string, unknown>): string | null {
  return data.orderId ? `/orders/${data.orderId}` : null
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
    getRoute: (data, role) => (role === USER_ROLES.ADMIN ? adminOrderDetail(data) : null),
  },
  [NOTIFICATION_TYPE.ORDER_PAID]: {
    icon: CheckmarkCircleOutline,
    color: '#18a058',
    getRoute: (data, role) => {
      if (role === USER_ROLES.ADMIN) return adminOrderDetail(data)
      if (role === USER_ROLES.OPERATOR) return '/operator'
      return null
    },
  },
  [NOTIFICATION_TYPE.ORDER_DELIVERED]: {
    icon: SendOutline,
    color: '#105080',
    getRoute: (data, role) => (role === USER_ROLES.ADMIN ? adminOrderDetail(data) : null),
  },
  [NOTIFICATION_TYPE.ORDER_RETOUCH_COMPLETED]: {
    icon: BrushOutline,
    color: '#8b5cf6',
    getRoute: (data, role) => (role === USER_ROLES.ADMIN ? adminOrderDetail(data) : null),
  },
}
