export const NOTIFICATION_TYPE = {
  PREVIEW_VIEWED: 'preview.viewed',
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_RETOUCH_COMPLETED: 'order.retouch_completed',
} as const

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE]

/** API projection from GET /notifications */
export interface IApiNotification {
  id: string
  type: string
  title: string
  message: string
  data: Record<string, unknown>
  isRead: boolean
  createdAt: string
  readAt: string | null
}

/** Frontend domain type */
export interface INotification {
  id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown>
  isRead: boolean
  createdAt: Date
  readAt: Date | null
}

/** WebSocket event payload (same shape as API but with id for dedup) */
export interface INotificationSocketPayload {
  id: string
  type: string
  title: string
  message: string
  data: Record<string, unknown>
  createdAt: string
}
