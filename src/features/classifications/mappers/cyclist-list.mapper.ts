import type { ParticipantSource } from '../types/responses/cyclist-detail.response'
import type {
  IApiParticipantListItem,
  IParticipantListItem,
} from '../types/responses/cyclist-list.response'

export function toParticipantListItem(api: IApiParticipantListItem): IParticipantListItem {
  return {
    id: api.id,
    photoId: api.photoId,
    source: api.source as ParticipantSource,
    identifier: api.identifier,
    colorCount: api.colorCount,
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
  }
}

export function toParticipantListItems(items: IApiParticipantListItem[]): IParticipantListItem[] {
  return items.map(toParticipantListItem)
}
