/** API projection from GET /operator/events/:eventId/retouch-queue — already camelCase */
export interface IApiRetouchQueueItem {
  photoId: string
  storageKey: string
  isRetouched: boolean
  retouchedStorageKey: string | null
}

export interface IApiRetouchQueueOrder {
  orderId: string
  buyerName: string
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
  storageKey: string
  isRetouched: boolean
  retouchedStorageKey: string | null
}

export interface IRetouchQueueOrder {
  orderId: string
  buyerName: string
  createdAt: Date
  totalItems: number
  retouchedItems: number
  items: IRetouchQueueItem[]
}
