export const PERMISSIONS = {
  EVENT_READ: 'event.read',
  PHOTO_READ: 'photo.read',
  PHOTO_RETOUCH_READ: 'photo.retouch.read',
  REVIEW_QUEUE_READ: 'dashboard.review_queue.read',
  ORDER_READ: 'order.read',
  PREVIEW_LINK_READ: 'preview_link.read',
  BUYER_READ: 'buyer.read',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
