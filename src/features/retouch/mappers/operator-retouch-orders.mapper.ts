import type {
  IApiOperatorRetouchOrder,
  IOperatorRetouchOrder,
} from '../types/responses/operator-retouch-orders.response'

export function toOperatorRetouchOrder(api: IApiOperatorRetouchOrder): IOperatorRetouchOrder {
  return {
    orderId: api.orderId,
    buyerName: api.buyerName,
    eventId: api.eventId,
    eventName: api.eventName,
    createdAt: new Date(api.createdAt),
    pendingPhotosCount: api.pendingPhotosCount,
    totalPhotosCount: api.totalPhotosCount,
    retouchedPhotosCount: api.retouchedPhotosCount,
    previewPhotos: api.previewPhotos.map((p) => ({ ...p })),
  }
}

export function toOperatorRetouchOrdersList(
  apiItems: IApiOperatorRetouchOrder[],
): IOperatorRetouchOrder[] {
  return apiItems.map(toOperatorRetouchOrder)
}
