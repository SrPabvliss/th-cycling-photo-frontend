import type { ParticipantSource } from './cyclist-detail.response'

/** API projection from GET /photos/:photoId/participants */
export interface IApiParticipantListItem {
  id: string
  photoId: string
  source: string
  identifier: string | null
  colorCount: number
  createdAt: string
  updatedAt: string
}

/** Frontend domain type */
export interface IParticipantListItem {
  id: string
  photoId: string
  source: ParticipantSource
  identifier: string | null
  colorCount: number
  createdAt: Date
  updatedAt: Date
}
