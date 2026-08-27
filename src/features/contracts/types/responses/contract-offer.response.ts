/**
 * API projection from GET /contracts/token/:token.
 * When `blockedReason` is `contract.not_yours` every other field comes back null by design.
 */
export interface IApiContractOffer {
  id: string | null
  commercialName: string | null
  eventsTotal: number | null
  photosPerEvent: number | null
  validUntil: string | null
  termsVersion: string | null
  status: string | null
  blockedReason: string | null
}

/** Frontend domain type with parsed dates. `photosPerEvent: null` means unlimited. */
export interface IContractOffer {
  id: string | null
  commercialName: string | null
  eventsTotal: number | null
  photosPerEvent: number | null
  validUntil: Date | null
  termsVersion: string | null
  status: string | null
  blockedReason: string | null
}
