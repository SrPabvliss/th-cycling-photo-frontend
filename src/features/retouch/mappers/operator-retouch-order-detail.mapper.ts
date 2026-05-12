import type {
  IApiOperatorRetouchOrderDetail,
  IOperatorRetouchOrderDetail,
} from '../types/responses/operator-retouch-order-detail.response'

export function toOperatorRetouchOrderDetail(
  api: IApiOperatorRetouchOrderDetail,
): IOperatorRetouchOrderDetail {
  return {
    orderId: api.orderId,
    buyerName: api.buyerName,
    eventId: api.eventId,
    eventName: api.eventName,
    createdAt: new Date(api.createdAt),
    photos: api.photos.map((p) => ({
      photoId: p.photoId,
      publicSlug: p.publicSlug,
      filename: p.filename,
      thumbnailUrl: p.thumbnailUrl,
      isRetouched: p.isRetouched,
    })),
  }
}
