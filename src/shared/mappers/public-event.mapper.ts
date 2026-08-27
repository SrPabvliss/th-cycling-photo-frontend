import { parseDateOnly } from '@/shared/utils/date.utils'
import type {
  IApiPublicEventListItem,
  IPublicEventListItem,
} from '@/shared/types/public-event.types'

export function toPublicEventListItem(api: IApiPublicEventListItem): IPublicEventListItem {
  return {
    slug: api.slug,
    name: api.name,
    startDate: parseDateOnly(api.startDate),
    endDate: parseDateOnly(api.endDate),
    provinceName: api.provinceName,
    cantonName: api.cantonName,
    photoCount: api.photoCount,
    ownerName: api.ownerName,
    coverSlug: api.coverSlug,
  }
}
