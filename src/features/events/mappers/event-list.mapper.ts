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
    description: api.description,
    date: parseDateOnly(api.date),
    provinceName: api.provinceName,
    cantonName: api.cantonName,
    coverImageUrl: api.coverImageUrl,
    coverImageSlug: api.coverImageSlug,
    coverImageSource: api.coverImageSource as CoverImageSource | null,
    status: api.status as EventStatus,
    isFeatured: api.isFeatured,
    photoCount: api.photoCount,
    classifiedCount: api.classifiedCount,
    totalFileSize: api.totalFileSize,
  }
}

export function toEventListItems(items: IApiEventListItem[]): IEventListItem[] {
  return items.map(toEventListItem)
}
