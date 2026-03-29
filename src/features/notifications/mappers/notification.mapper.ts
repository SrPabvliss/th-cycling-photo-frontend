import type { IApiNotification, INotification, NotificationType } from '../types/notification.types'

export function toNotification(api: IApiNotification): INotification {
  return {
    id: api.id,
    type: api.type as NotificationType,
    title: api.title,
    message: api.message,
    data: api.data,
    isRead: api.isRead,
    createdAt: new Date(api.createdAt),
    readAt: api.readAt ? new Date(api.readAt) : null,
  }
}

export function toNotifications(items: IApiNotification[]): INotification[] {
  return items.map(toNotification)
}
