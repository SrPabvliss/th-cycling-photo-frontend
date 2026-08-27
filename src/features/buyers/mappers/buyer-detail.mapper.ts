import type {
  IApiBuyerConsent,
  IApiBuyerDetail,
  IApiBuyerOrder,
  IBuyerConsent,
  IBuyerDetail,
  IBuyerOrder,
} from '../types/responses/buyer-detail.response'

function toBuyerOrder(api: IApiBuyerOrder): IBuyerOrder {
  return {
    id: api.id,
    eventName: api.eventName,
    date: new Date(api.date),
    photoCount: api.photoCount,
    amount: api.amount,
    paymentMethod: api.paymentMethod,
    status: api.status,
  }
}

function toBuyerConsent(api: IApiBuyerConsent): IBuyerConsent {
  return {
    type: api.type,
    policyVersion: api.policyVersion,
    acceptedAt: new Date(api.acceptedAt),
  }
}

export function toBuyerDetail(api: IApiBuyerDetail): IBuyerDetail {
  return {
    id: api.id,
    firstName: api.firstName,
    lastName: api.lastName,
    email: api.email,
    emailVerified: api.emailVerified,
    isActive: api.isActive,
    createdAt: new Date(api.createdAt),
    lastLoginAt: api.lastLoginAt ? new Date(api.lastLoginAt) : null,
    primaryPhone: api.primaryPhone,
    isWhatsapp: api.isWhatsapp,
    countryName: api.countryName,
    provinceName: api.provinceName,
    cityName: api.cityName,
    birthDate: api.birthDate ? new Date(api.birthDate) : null,
    gender: api.gender,
    orderCount: api.orderCount,
    spent: api.spent,
    averageTicket: api.averageTicket,
    photoCount: api.photoCount,
    eventCount: api.eventCount,
    eventNames: api.eventNames,
    firstOrderAt: api.firstOrderAt ? new Date(api.firstOrderAt) : null,
    lastOrderAt: api.lastOrderAt ? new Date(api.lastOrderAt) : null,
    unpaidCount: api.unpaidCount,
    orders: api.orders.map(toBuyerOrder),
    consents: api.consents.map(toBuyerConsent),
  }
}
