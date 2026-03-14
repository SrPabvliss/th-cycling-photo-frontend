import type {
  CoverImageSource,
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
    provinceName: api.provinceName,
    cantonName: api.cantonName,
    coverImageUrl: api.coverImageUrl,
    coverImageSource: api.coverImageSource as CoverImageSource | null,
    status: api.status as EventStatus,
    photoCount: api.photoCount,
    classifiedCount: api.classifiedCount,
    totalFileSize: api.totalFileSize,
  }
}

export function toEventListItems(items: IApiEventListItem[]): IEventListItem[] {
  return items.map(toEventListItem)
}
