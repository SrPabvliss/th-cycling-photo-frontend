import type {
  IApiRetouchQueueOrder,
  IRetouchQueueOrder,
} from '../types/responses/retouch-queue.response'

function toRetouchQueueOrder(api: IApiRetouchQueueOrder): IRetouchQueueOrder {
  return {
    orderId: api.orderId,
    buyerName: api.buyerName,
    createdAt: new Date(api.createdAt),
    totalItems: api.totalItems,
    retouchedItems: api.retouchedItems,
    items: api.items.map((item) => ({
      photoId: item.photoId,
      storageKey: item.storageKey,
      isRetouched: item.isRetouched,
      retouchedStorageKey: item.retouchedStorageKey,
    })),
  }
}

export function toRetouchQueueOrders(apiOrders: IApiRetouchQueueOrder[]): IRetouchQueueOrder[] {
  return apiOrders.map(toRetouchQueueOrder)
}
