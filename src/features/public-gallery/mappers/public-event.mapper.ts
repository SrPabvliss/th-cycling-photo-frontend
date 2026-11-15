import { parseDateOnly } from '@/shared/utils/date.utils'
import type {
  IApiPublicEventDetail,
  IPublicEventDetail,
} from '../types/responses/public-event-detail.response'

export function toPublicEventDetail(api: IApiPublicEventDetail): IPublicEventDetail {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    startDate: parseDateOnly(api.startDate),
    endDate: parseDateOnly(api.endDate),
    provinceName: api.provinceName,
    cantonName: api.cantonName,
    photoCount: api.photoCount,
    ownerName: api.ownerName,
    assets: api.assets,
    photoCategories: api.photoCategories,
  }
}
