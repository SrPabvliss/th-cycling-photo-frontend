import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import type { IApiPublicEventListItem, IPublicEventListItem } from './public-event.types'

const toCalendarDate = (value: string): string => value.split('T')[0]!

export function toPublicEventListItem(api: IApiPublicEventListItem): IPublicEventListItem {
  const place = [api.cantonName, api.provinceName].filter(Boolean).join(', ')

  return {
    slug: api.slug,
    name: api.name,
    startDate: toCalendarDate(api.startDate),
    endDate: toCalendarDate(api.endDate),
    placeLabel: place || null,
    photoCount: api.photoCount,
    ownerName: api.ownerName,
    coverUrl: api.coverSlug ? getAssetPresetUrl(api.coverSlug, 'cover-sm') : null,
    eventTypeId: api.eventTypeId,
    eventTypeName: api.eventTypeName,
  }
}
