export const PERMISSIONS = {
  EVENT_READ: 'event.read',
  EVENT_READ_ALL: 'event.read.all',
  EVENT_CREATE: 'event.create',
  EVENT_UPDATE: 'event.update',
  EVENT_FREEZE: 'event.freeze',
  EVENT_PHOTO_QUOTA_SET: 'event.photo_quota.set',
  EVENT_ARCHIVE: 'event.archive',
  EVENT_RESTORE: 'event.restore',
  PHOTO_READ: 'photo.read',
  PHOTO_RETOUCH_READ: 'photo.retouch.read',
  PHOTO_RETOUCH_UPLOAD: 'photo.retouch.upload',
  PHOTO_CLASSIFICATION_RETRY: 'photo.classification.retry',
  PHOTO_CATEGORY_CREATE: 'photo_category.create',
  REVIEW_QUEUE_READ: 'dashboard.review_queue.read',
  ORDER_READ: 'order.read',
  ORDER_NOTIFY_PAYMENT: 'order.notify_payment',
  ORDER_CONFIRM_PAYMENT: 'order.confirm_payment',
  ORDER_DELIVER: 'order.deliver',
  ORDER_DELIVERY_REGENERATE: 'order.delivery.regenerate',
  ORDER_CANCEL: 'order.cancel',
  CART_CHECKOUT: 'cart.checkout',
  PREVIEW_LINK_READ: 'preview_link.read',
  BUYER_READ: 'buyer.read',
  EVENT_COLLABORATOR_READ: 'event.collaborator.read',
  TENANT_READ: 'tenant.read',
  CONTRACT_READ: 'contract.read',
  CONTRACT_ISSUE: 'contract.issue',
  CONTRACT_REVOKE: 'contract.revoke',
  TENANT_PROFILE_READ: 'tenant.profile.read',
  TENANT_PROFILE_UPDATE: 'tenant.profile.update',
  TENANT_PAYOUT_METHOD_READ: 'tenant.payout_method.read',
  TENANT_PAYOUT_METHOD_MANAGE: 'tenant.payout_method.manage',
  TENANT_QUOTA_SET: 'tenant.quota.set',
  DASHBOARD_OPERATOR_READ: 'dashboard.operator.read',
  NOTIFICATION_READ: 'notification.read',
  ORDER_GIFT: 'order.gift',
  ORDER_CONVERT_TO_GIFT: 'order.convert_to_gift',
  ORDER_CONVERT_TO_SALE: 'order.convert_to_sale',
  ORDER_INVOICE_MANAGE: 'order.invoice.manage',
} as const

export function holdsPermission(
  user: { permissions: string[]; eventPermissions: Record<string, string[]> } | null | undefined,
  key: string,
  eventId?: string | null,
): boolean {
  if (!user) return false
  if (user.permissions.includes(key)) return true
  if (eventId) return user.eventPermissions[eventId]?.includes(key) ?? false
  return Object.values(user.eventPermissions).some((keys) => keys.includes(key))
}

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
