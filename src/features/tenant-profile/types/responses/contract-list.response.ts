export type ContractStatus = 'pending' | 'accepted' | 'revoked' | 'expired'

/** API projection from GET /contracts */
export interface IApiContractListItem {
  id: string
  commercialName: string
  eventsTotal: number
  eventsUsed: number
  photosPerEvent: number | null
  status: string
  validUntil: string
  termsVersion: string
  acceptedAt: string | null
  holderEmail: string
  holderName: string | null
  isBackfill: boolean
}

/** Frontend domain type with parsed dates and typed status. `photosPerEvent: null` means unlimited. */
export interface IContractListItem {
  id: string
  commercialName: string
  eventsTotal: number
  eventsUsed: number
  photosPerEvent: number | null
  status: ContractStatus
  validUntil: Date
  termsVersion: string
  acceptedAt: Date | null
  holderEmail: string
  holderName: string | null
  isBackfill: boolean
}
