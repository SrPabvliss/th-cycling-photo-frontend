import type {
  EventStatus,
  IApiEventListItem,
  IEventListItem,
} from '../types/responses/event-list.response'
import { parseDateOnly } from '@/shared/utils/date.utils'

export function toEventListItem(api: IApiEventListItem): IEventListItem {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    date: parseDateOnly(api.date),
    provinceName: api.provinceName,
    cantonName: api.cantonName,
    coverImageUrl: api.coverImageUrl,
    coverImageSlug: api.coverImageSlug,
    status: api.status as EventStatus,
    isFeatured: api.isFeatured,
    photoCount: api.photoCount,
    totalFileSize: api.totalFileSize,
  }
}

export function toEventListItems(items: IApiEventListItem[]): IEventListItem[] {
  return items.map(toEventListItem)
}
