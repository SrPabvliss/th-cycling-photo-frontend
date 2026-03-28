import { getPhotoUrl, getTransformedPhotoUrl } from '@/shared/utils/cdn.utils'
import type {
  DeliveryLinkStatus,
  IApiOrderDetail,
  IApiOrderDetailDeliveryLink,
  IApiOrderDetailPhoto,
  IOrderDetail,
  IOrderDetailDeliveryLink,
  IOrderDetailPhoto,
} from '../types/responses/order-detail.response'
import type { OrderStatus } from '../types/responses/order-list.response'

function toOrderDetailPhoto(api: IApiOrderDetailPhoto): IOrderDetailPhoto {
  return {
    id: api.id,
    filename: api.filename,
    thumbnailUrl: getTransformedPhotoUrl(api.storageKey, 'thumbnail'),
    fullUrl: getPhotoUrl(api.storageKey),
  }
}

function toOrderDetailDeliveryLink(api: IApiOrderDetailDeliveryLink): IOrderDetailDeliveryLink {
  return {
    token: api.token,
    status: api.status as DeliveryLinkStatus,
    expiresAt: new Date(api.expiresAt),
    downloadCount: api.downloadCount,
  }
}

export function toOrderDetail(api: IApiOrderDetail): IOrderDetail {
  return {
    id: api.id,
    status: api.status as OrderStatus,
    notes: api.notes,
    createdAt: new Date(api.createdAt),
    paidAt: api.paidAt ? new Date(api.paidAt) : null,
    deliveredAt: api.deliveredAt ? new Date(api.deliveredAt) : null,
    cancelledAt: api.cancelledAt ? new Date(api.cancelledAt) : null,
    customer: {
      id: api.customer.id,
      firstName: api.customer.firstName,
      lastName: api.customer.lastName,
      whatsapp: api.customer.whatsapp,
      email: api.customer.email,
    },
    eventName: api.eventName,
    previewLinkToken: api.previewLinkToken,
    photos: api.photos.map(toOrderDetailPhoto),
    deliveryLink: api.deliveryLink ? toOrderDetailDeliveryLink(api.deliveryLink) : null,
  }
}
