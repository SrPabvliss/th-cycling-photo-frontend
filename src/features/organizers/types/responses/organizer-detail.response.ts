import type { OrganizerState } from './organizer-list.response'

export interface IApiOrganizerContract {
  id: string
  eventsTotal: number
  eventsUsed: number
  photosPerEvent: number | null
  isValid: boolean
  isRevoked: boolean
  lostSlots: number
  validUntil: string
  acceptedAt: string | null
  termsVersion: string
  issuedByName: string | null
  issuedAt: string
  isBackfill: boolean
}

export interface IOrganizerContract {
  id: string
  eventsTotal: number
  eventsUsed: number
  photosPerEvent: number | null
  isValid: boolean
  isRevoked: boolean
  lostSlots: number
  validUntil: string
  acceptedAt: Date | null
  termsVersion: string
  issuedByName: string | null
  issuedAt: Date
  isBackfill: boolean
}

export interface IApiOrganizerPayout {
  id: string
  provider: string
  isActive: boolean
  bankName: string | null
  accountNumber: string | null
  accountType: string | null
  accountHolder: string | null
  holderIdentification: string | null
  receiverIdentifier: string | null
  verifiedAt: string | null
}

export interface IOrganizerPayout {
  id: string
  provider: string
  isActive: boolean
  bankName: string | null
  accountNumber: string | null
  accountType: string | null
  accountHolder: string | null
  holderIdentification: string | null
  receiverIdentifier: string | null
  verifiedAt: Date | null
}

export interface IApiOrganizerDetail {
  id: string
  name: string
  publicName: string | null
  watermarkUrl: string | null
  whatsappNumber: string | null
  whatsappVerified: boolean
  holderName: string
  holderEmail: string
  holderEmailVerified: boolean
  accountCount: number
  createdAt: string
  state: OrganizerState
  available: number
  totalCapacity: number
  usedCapacity: number
  validContractCount: number
  nextExpiry: string | null
  lostSlots: number
  photosPerEventInUse: number | null
  photoLimitsDiffer: boolean
  eventCount: number
  lastEventAt: string | null
  defaultEventPhotoQuota: number | null
  contracts: IApiOrganizerContract[]
  payouts: IApiOrganizerPayout[]
}

export interface IOrganizerDetail {
  id: string
  name: string
  publicName: string | null
  watermarkUrl: string | null
  whatsappNumber: string | null
  whatsappVerified: boolean
  holderName: string
  holderEmail: string
  holderEmailVerified: boolean
  accountCount: number
  createdAt: Date
  state: OrganizerState
  available: number
  totalCapacity: number
  usedCapacity: number
  validContractCount: number
  nextExpiry: string | null
  lostSlots: number
  photosPerEventInUse: number | null
  photoLimitsDiffer: boolean
  eventCount: number
  lastEventAt: Date | null
  defaultEventPhotoQuota: number | null
  contracts: IOrganizerContract[]
  payouts: IOrganizerPayout[]
}
