/** API projection for plate number — nested in cyclist detail */
export interface IApiPlateNumber {
  id: string
  number: number
  confidenceScore: number | null
  manuallyCorrected: boolean
  correctedAt: string | null
}

/** Frontend domain type with parsed dates */
export interface IPlateNumber {
  id: string
  number: number
  confidenceScore: number | null
  manuallyCorrected: boolean
  correctedAt: Date | null
}
