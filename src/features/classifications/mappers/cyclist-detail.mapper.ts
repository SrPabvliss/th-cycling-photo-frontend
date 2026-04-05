import type { ParticipantSource } from '../types/responses/cyclist-detail.response'
import type {
  IApiParticipantDetail,
  IParticipantDetail,
} from '../types/responses/cyclist-detail.response'
import { toGearColor } from './equipment-color.mapper'
import { toIdentifier } from './plate-number.mapper'

export function toParticipantDetail(api: IApiParticipantDetail): IParticipantDetail {
  return {
    id: api.id,
    photoId: api.photoId,
    source: api.source as ParticipantSource,
    identifier: api.identifier ? toIdentifier(api.identifier) : null,
    gearColors: api.gearColors.map(toGearColor),
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
  }
}
