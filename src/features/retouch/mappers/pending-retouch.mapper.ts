import type {
  IApiPendingRetouchGroup,
  IApiPendingRetouchPhoto,
  IPendingRetouchGroup,
  IPendingRetouchPhoto,
} from '../types/responses/pending-retouch.response'

function toPendingRetouchPhoto(api: IApiPendingRetouchPhoto): IPendingRetouchPhoto {
  return {
    id: api.id,
    filename: api.filename,
    thumbnailUrl: api.thumbnailUrl,
    isRetouched: api.isRetouched,
  }
}

export function toPendingRetouchGroup(api: IApiPendingRetouchGroup): IPendingRetouchGroup {
  return {
    orderId: api.orderId,
    orderCreatedAt: new Date(api.orderCreatedAt),
    eventName: api.eventName,
    userName: api.userName,
    photos: api.photos.map(toPendingRetouchPhoto),
  }
}
