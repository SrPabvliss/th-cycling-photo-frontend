/** API projection for participant identifier — nested in participant detail */
export interface IApiIdentifier {
  id: string
  value: string
  confidenceScore: number | null
  manuallyCorrected: boolean
  correctedAt: string | null
}

/** Frontend domain type with parsed dates */
export interface IIdentifier {
  id: string
  value: string
  confidenceScore: number | null
  manuallyCorrected: boolean
  correctedAt: Date | null
}
