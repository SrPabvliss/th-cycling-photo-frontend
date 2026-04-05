import type { IApiBuyerListItem, IBuyerListItem } from '../types/responses/buyer-list.response'

export function toBuyerListItem(api: IApiBuyerListItem): IBuyerListItem {
  return {
    id: api.id,
    firstName: api.firstName,
    lastName: api.lastName,
    email: api.email,
    primaryPhone: api.primaryPhone,
    isWhatsapp: api.isWhatsapp,
    countryName: api.countryName,
    orderCount: api.orderCount,
    lastOrderAt: api.lastOrderAt ? new Date(api.lastOrderAt) : null,
    createdAt: new Date(api.createdAt),
  }
}
