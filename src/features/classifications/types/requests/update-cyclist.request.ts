import type { IGearColorInput } from './create-cyclist.request'

export interface IUpdateParticipantRequest {
  identifier?: string | null
  colors?: IGearColorInput[]
}
