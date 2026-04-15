import { parseDateOnly } from '@/shared/utils/date.utils'
import type {
  IApiPublicEventListItem,
  IPublicEventListItem,
} from '../types/responses/public-event-list.response'
import type {
  IApiPublicEventDetail,
  IPublicEventDetail,
} from '../types/responses/public-event-detail.response'

export function toPublicEventListItem(api: IApiPublicEventListItem): IPublicEventListItem {
  return {
    slug: api.slug,
    name: api.name,
    date: parseDateOnly(api.date),
    provinceName: api.provinceName,
    cantonName: api.cantonName,
    isFeatured: api.isFeatured,
    photoCount: api.photoCount,
    coverSlug: api.coverSlug,
  }
}

export function toPublicEventDetail(api: IApiPublicEventDetail): IPublicEventDetail {
  return {
    slug: api.slug,
    name: api.name,
    description: api.description,
    date: parseDateOnly(api.date),
    provinceName: api.provinceName,
    cantonName: api.cantonName,
    isFeatured: api.isFeatured,
    photoCount: api.photoCount,
    assets: api.assets,
    photoCategories: api.photoCategories,
  }
}
