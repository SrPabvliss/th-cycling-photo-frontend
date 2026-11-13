import type {
  DeliveryStatus,
  IApiDeliveryData,
  IApiDeliveryPhoto,
  IDeliveryData,
  IDeliveryPhoto,
} from '../types/responses/delivery-data.response'

function toDeliveryPhoto(api: IApiDeliveryPhoto): IDeliveryPhoto {
  return {
    id: api.id,
    filename: api.filename,
    downloadUrl: api.downloadUrl,
    fileSize: api.fileSize,
    thumbnailUrl: api.thumbnailUrl ?? null,
  }
}

export function toDeliveryData(api: IApiDeliveryData): IDeliveryData {
  return {
    token: api.token,
    eventName: api.eventName,
    customerName: api.customerName,
    status: api.status as DeliveryStatus,
    expiresAt: api.expiresAt ? new Date(api.expiresAt) : null,
    downloadCount: api.downloadCount,
    photos: api.photos.map(toDeliveryPhoto),
  }
}
