import type { IApiBuyerListItem, IBuyerListItem } from '../types/responses/buyer-list.response'

export function toBuyerListItem(api: IApiBuyerListItem): IBuyerListItem {
  return {
    id: api.id,
    firstName: api.firstName,
    lastName: api.lastName,
    email: api.email,
    emailVerified: api.emailVerified,
    primaryPhone: api.primaryPhone,
    isWhatsapp: api.isWhatsapp,
    isActive: api.isActive,
    lastLoginAt: api.lastLoginAt ? new Date(api.lastLoginAt) : null,
    countryName: api.countryName,
    provinceName: api.provinceName,
    cityName: api.cityName,
    birthDate: api.birthDate ? new Date(api.birthDate) : null,
    gender: api.gender,
    orderCount: api.orderCount,
    spent: api.spent,
    photoCount: api.photoCount,
    eventCount: api.eventCount,
    eventNames: api.eventNames,
    firstOrderAt: api.firstOrderAt ? new Date(api.firstOrderAt) : null,
    lastOrderAt: api.lastOrderAt ? new Date(api.lastOrderAt) : null,
    unpaidCount: api.unpaidCount,
    createdAt: new Date(api.createdAt),
  }
}

export function toBuyerListItems(items: IApiBuyerListItem[]): IBuyerListItem[] {
  return items.map(toBuyerListItem)
}
