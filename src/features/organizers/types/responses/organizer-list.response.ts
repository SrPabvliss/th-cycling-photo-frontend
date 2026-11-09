export type OrganizerState = 'active' | 'expiring' | 'no_quota'
export type InvitationState = 'pending' | 'expired' | 'revoked'

export interface IApiOrganizerCard {
  kind: 'organizer'
  id: string
  name: string
  holderName: string
  holderEmail: string
  holderEmailVerified: boolean
  state: OrganizerState
  available: number
  totalCapacity: number
  usedCapacity: number
  nextExpiry: string | null
  lastExpiry: string | null
  lostSlots: number
  photosPerEventInUse: number | null
  photoLimitsDiffer: boolean
  createdAt: string
}

export interface IApiInvitationCard {
  kind: 'invitation'
  id: string
  commercialName: string
  holderName: string
  holderEmail: string
  holderEmailVerified: boolean
  state: InvitationState
  eventsTotal: number
  photosPerEvent: number | null
  validUntil: string
  issuedAt: string
  issuedByName: string | null
  renewalOfOrganizerId: string | null
  renewalOfOrganizerName: string | null
}

export type IApiOrganizerRow = IApiOrganizerCard | IApiInvitationCard

export interface IOrganizerCard {
  kind: 'organizer'
  id: string
  name: string
  holderName: string
  holderEmail: string
  holderEmailVerified: boolean
  state: OrganizerState
  available: number
  totalCapacity: number
  usedCapacity: number
  nextExpiry: string | null
  lastExpiry: string | null
  lostSlots: number
  photosPerEventInUse: number | null
  photoLimitsDiffer: boolean
  createdAt: Date
}

export interface IInvitationCard {
  kind: 'invitation'
  id: string
  commercialName: string
  holderName: string
  holderEmail: string
  holderEmailVerified: boolean
  state: InvitationState
  eventsTotal: number
  photosPerEvent: number | null
  validUntil: string
  issuedAt: Date
  issuedByName: string | null
  renewalOfOrganizerId: string | null
  renewalOfOrganizerName: string | null
}

export type IOrganizerRow = IOrganizerCard | IInvitationCard
