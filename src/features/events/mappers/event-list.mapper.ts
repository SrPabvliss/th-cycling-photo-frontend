import type {
  EventStatus,
  IApiEventListItem,
  IEventListItem,
} from '../types/responses/event-list.response'
import { parseDateOnly } from '@/shared/utils/date.utils'

export function toEventListItem(api: IApiEventListItem): IEventListItem {
  return {
    id: api.id,
    name: api.name,
    date: parseDateOnly(api.date),
    location: api.location,
    status: api.status as EventStatus,
    totalPhotos: api.totalPhotos,
    processedPhotos: api.processedPhotos,
  }
}

export function toEventListItems(items: IApiEventListItem[]): IEventListItem[] {
  return items.map(toEventListItem)
}
