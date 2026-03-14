import type { CyclistSource } from '../types/responses/cyclist-detail.response'
import type {
  IApiCyclistListItem,
  ICyclistListItem,
} from '../types/responses/cyclist-list.response'

export function toCyclistListItem(api: IApiCyclistListItem): ICyclistListItem {
  return {
    id: api.id,
    photoId: api.photoId,
    source: api.source as CyclistSource,
    plateNumber: api.plateNumber,
    colorCount: api.colorCount,
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
  }
}

export function toCyclistListItems(items: IApiCyclistListItem[]): ICyclistListItem[] {
  return items.map(toCyclistListItem)
}
