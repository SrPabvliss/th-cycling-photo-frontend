import type {
  IApiInvitationCard,
  IApiOrganizerCard,
  IApiOrganizerRow,
  IInvitationCard,
  IOrganizerCard,
  IOrganizerRow,
} from '../types/responses/organizer-list.response'

function toOrganizerCard(api: IApiOrganizerCard): IOrganizerCard {
  return {
    kind: 'organizer',
    id: api.id,
    name: api.name,
    holderName: api.holderName,
    holderEmail: api.holderEmail,
    holderEmailVerified: api.holderEmailVerified,
    state: api.state,
    available: api.available,
    totalCapacity: api.totalCapacity,
    usedCapacity: api.usedCapacity,
    nextExpiry: api.nextExpiry,
    lastExpiry: api.lastExpiry,
    lostSlots: api.lostSlots,
    photosPerEventInUse: api.photosPerEventInUse,
    photoLimitsDiffer: api.photoLimitsDiffer,
    createdAt: new Date(api.createdAt),
  }
}

function toInvitationCard(api: IApiInvitationCard): IInvitationCard {
  return {
    kind: 'invitation',
    id: api.id,
    commercialName: api.commercialName,
    holderName: api.holderName,
    holderEmail: api.holderEmail,
    holderEmailVerified: api.holderEmailVerified,
    state: api.state,
    eventsTotal: api.eventsTotal,
    photosPerEvent: api.photosPerEvent,
    validUntil: api.validUntil,
    issuedAt: new Date(api.issuedAt),
    issuedByName: api.issuedByName,
    renewalOfOrganizerId: api.renewalOfOrganizerId,
    renewalOfOrganizerName: api.renewalOfOrganizerName,
  }
}

export function toOrganizerRow(api: IApiOrganizerRow): IOrganizerRow {
  return api.kind === 'organizer' ? toOrganizerCard(api) : toInvitationCard(api)
}

export function toOrganizerRows(items: IApiOrganizerRow[]): IOrganizerRow[] {
  return items.map(toOrganizerRow)
}
