import type { OrderStatus } from '../types/responses/order-list.response'
import type { IApiOrderListItem, IOrderListItem } from '../types/responses/order-list.response'

function toOrderListItem(api: IApiOrderListItem): IOrderListItem {
  return {
    id: api.id,
    status: api.status as OrderStatus,
    createdAt: new Date(api.createdAt),
    paidAt: api.paidAt ? new Date(api.paidAt) : null,
    deliveredAt: api.deliveredAt ? new Date(api.deliveredAt) : null,
    userName: api.userName,
    snapWhatsapp: api.snapWhatsapp,
    eventName: api.eventName,
    photoCount: api.photoCount,
    hasDeliveryLink: api.hasDeliveryLink,
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
