import type { IApiPlateNumber, IPlateNumber } from '../types/responses/plate-number.response'

export function toPlateNumber(api: IApiPlateNumber): IPlateNumber {
  return {
    id: api.id,
    number: api.number,
    confidenceScore: api.confidenceScore,
    manuallyCorrected: api.manuallyCorrected,
    correctedAt: api.correctedAt ? new Date(api.correctedAt) : null,
  }
}
