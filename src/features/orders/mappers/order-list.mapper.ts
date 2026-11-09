import type { OrderStatus } from '../types/responses/order-list.response'
import type { IApiOrderListItem, IOrderListItem } from '../types/responses/order-list.response'

function toOrderListItem(api: IApiOrderListItem): IOrderListItem {
  return {
    id: api.id,
    status: api.status as OrderStatus,
    createdAt: new Date(api.createdAt),
    notifiedAt: api.notifiedAt ? new Date(api.notifiedAt) : null,
    paidAt: api.paidAt ? new Date(api.paidAt) : null,
    deliveredAt: api.deliveredAt ? new Date(api.deliveredAt) : null,
    cancelledAt: api.cancelledAt ? new Date(api.cancelledAt) : null,
    eventId: api.eventId,
    userName: api.userName,
    userId: api.userId,
    customerFirstName: api.customerFirstName,
    customerLastName: api.customerLastName,
    customerEmail: api.customerEmail,
    customerPrimaryPhone: api.customerPrimaryPhone,
    snapWhatsapp: api.snapWhatsapp,
    eventName: api.eventName,
    photoCount: api.photoCount,
    hasDeliveryLink: api.hasDeliveryLink,
    subtotal: api.subtotal === null ? null : Number(api.subtotal),
    subtotalDecimal: api.subtotal ?? null,
    snapCurrency: api.snapCurrency,
    paymentMethod: api.paymentMethod,
    previewPhotos: api.previewPhotos.map((p) => ({
      photoId: p.photoId,
      publicSlug: p.publicSlug,
      thumbnailUrl: p.thumbnailUrl,
      filename: p.filename,
    })),
  }
}

export function toOrderListItems(items: IApiOrderListItem[]): IOrderListItem[] {
  return items.map(toOrderListItem)
}
