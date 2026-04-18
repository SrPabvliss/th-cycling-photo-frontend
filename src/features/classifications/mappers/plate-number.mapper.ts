import type { IApiIdentifier, IIdentifier } from '../types/responses/plate-number.response'

export function toIdentifier(api: IApiIdentifier): IIdentifier {
  return {
    id: api.id,
    value: api.value,
    confidenceScore: api.confidenceScore,
    manuallyCorrected: api.manuallyCorrected,
    correctedAt: api.correctedAt ? new Date(api.correctedAt) : null,
  }
}
