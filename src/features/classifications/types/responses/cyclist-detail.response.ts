import type { IApiGearColor, IGearColor } from './equipment-color.response'
import type { IApiIdentifier, IIdentifier } from './plate-number.response'

export type ParticipantSource = 'manual' | 'ai'

/** API projection from GET /participants/:id */
export interface IApiParticipantDetail {
  id: string
  photoId: string
  source: string
  identifier: IApiIdentifier | null
  gearColors: IApiGearColor[]
  createdAt: string
  updatedAt: string
}

/** Frontend domain type with parsed dates and typed enums */
export interface IParticipantDetail {
  id: string
  photoId: string
  source: ParticipantSource
  identifier: IIdentifier | null
  gearColors: IGearColor[]
  createdAt: Date
  updatedAt: Date
}
