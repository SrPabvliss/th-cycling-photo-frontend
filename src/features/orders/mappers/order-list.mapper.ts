import type { OrderStatus } from '../types/responses/order-list.response'
import type { IApiOrderListItem, IOrderListItem } from '../types/responses/order-list.response'

function toOrderListItem(api: IApiOrderListItem): IOrderListItem {
  return {
    id: api.id,
    status: api.status as OrderStatus,
    createdAt: new Date(api.createdAt),
    paidAt: api.paidAt ? new Date(api.paidAt) : null,
    deliveredAt: api.deliveredAt ? new Date(api.deliveredAt) : null,
    customerName: api.customerName,
    customerWhatsapp: api.customerWhatsapp,
    eventName: api.eventName,
    photoCount: api.photoCount,
    hasDeliveryLink: api.hasDeliveryLink,
  }
}

export function toOrderListItems(items: IApiOrderListItem[]): IOrderListItem[] {
  return items.map(toOrderListItem)
}
