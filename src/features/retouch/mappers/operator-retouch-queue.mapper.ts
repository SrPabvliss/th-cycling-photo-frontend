import type {
  IApiRetouchQueueOrder,
  IRetouchQueueOrder,
} from '../types/responses/operator-retouch-queue.response'

export function toRetouchQueueOrder(api: IApiRetouchQueueOrder): IRetouchQueueOrder {
  return {
    orderId: api.orderId,
    buyerName: api.buyerName,
    eventId: api.eventId,
    eventName: api.eventName,
    createdAt: new Date(api.createdAt),
    totalItems: api.totalItems,
    retouchedItems: api.retouchedItems,
    items: api.items.map((item) => ({
      photoId: item.photoId,
      publicSlug: item.publicSlug,
      thumbnailUrl: item.thumbnailUrl,
      isRetouched: item.isRetouched,
    })),
  }
}

export function toRetouchQueueOrders(apiOrders: IApiRetouchQueueOrder[]): IRetouchQueueOrder[] {
  return apiOrders.map(toRetouchQueueOrder)
}
