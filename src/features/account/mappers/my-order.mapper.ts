import type {
  IApiMyOrderDetail,
  IApiMyOrderDownloads,
  IApiMyOrderListItem,
  IApiMyOrdersSummary,
  IMyOrderDetail,
  IMyOrderDownloads,
  IMyOrderListItem,
  IMyOrdersSummary,
} from '../types/responses/my-order.response'

export function toMyOrderList(api: IApiMyOrderListItem[]): IMyOrderListItem[] {
  return api.map((order) => ({
    id: order.id,
    state: order.state,
    eventName: order.eventName,
    createdAt: order.createdAt,
    photoCount: order.photoCount,
    subtotal: order.subtotal,
    currency: order.snapCurrency,
    previewPhotos: order.previewPhotos,
  }))
}

export function toMyOrderDetail(api: IApiMyOrderDetail): IMyOrderDetail {
  return {
    id: api.id,
    state: api.state,
    eventName: api.eventName,
    createdAt: api.createdAt,
    subtotal: api.subtotal,
    currency: api.snapCurrency,
    canDownload: api.canDownload,
    canCancel: api.canCancel,
    photos: api.photos,
  }
}

export function toMyOrderDownloads(api: IApiMyOrderDownloads): IMyOrderDownloads {
  return { orderId: api.orderId, photos: api.photos }
}

export function toMyOrdersSummary(api: IApiMyOrdersSummary): IMyOrdersSummary {
  return {
    orderCount: api.orderCount,
    photoCount: api.photoCount,
    eventCount: api.eventCount,
    spent: api.spent.map((entry) => ({ currency: entry.currency, amount: entry.amount })),
  }
}
