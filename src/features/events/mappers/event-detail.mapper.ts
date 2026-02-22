import type { EventStatus } from '../types/responses/event-list.response'
import type { IApiEventDetail, IEventDetail } from '../types/responses/event-detail.response'
import { parseDateOnly } from '@/shared/utils/date.utils'

export function toEventDetail(api: IApiEventDetail): IEventDetail {
  return {
    id: api.id,
    name: api.name,
    date: parseDateOnly(api.date),
    location: api.location,
    status: api.status as EventStatus,
    totalPhotos: api.totalPhotos,
    processedPhotos: api.processedPhotos,
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
  }
}
