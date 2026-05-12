/** API projection from GET /operator/events/:eventId/retouch-queue — already camelCase */
export interface IApiRetouchQueueItem {
  photoId: string
  publicSlug: string
  thumbnailUrl: string
  isRetouched: boolean
}

export interface IApiRetouchQueueOrder {
  orderId: string
  buyerName: string
  eventId: string
  eventName: string
  createdAt: string
  totalItems: number
  retouchedItems: number
  items: IApiRetouchQueueItem[]
}

export interface IApiRetouchQueue {
  orders: IApiRetouchQueueOrder[]
}

/** Frontend domain types */
export interface IRetouchQueueItem {
  photoId: string
  publicSlug: string
  thumbnailUrl: string
  isRetouched: boolean
}

export interface IRetouchQueueOrder {
  orderId: string
  buyerName: string
  eventId: string
  eventName: string
  createdAt: Date
  totalItems: number
  retouchedItems: number
  items: IRetouchQueueItem[]
}
