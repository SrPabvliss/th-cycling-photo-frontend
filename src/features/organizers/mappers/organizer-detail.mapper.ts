import type {
  IApiOrganizerContract,
  IApiOrganizerDetail,
  IApiOrganizerPayout,
  IOrganizerContract,
  IOrganizerDetail,
  IOrganizerPayout,
} from '../types/responses/organizer-detail.response'

function toOrganizerContract(api: IApiOrganizerContract): IOrganizerContract {
  return {
    id: api.id,
    eventsTotal: api.eventsTotal,
    eventsUsed: api.eventsUsed,
    photosPerEvent: api.photosPerEvent,
    isValid: api.isValid,
    isRevoked: api.isRevoked,
    lostSlots: api.lostSlots,
    validUntil: api.validUntil,
    acceptedAt: api.acceptedAt ? new Date(api.acceptedAt) : null,
    termsVersion: api.termsVersion,
    issuedByName: api.issuedByName,
    issuedAt: new Date(api.issuedAt),
    isBackfill: api.isBackfill,
  }
}

function toOrganizerPayout(api: IApiOrganizerPayout): IOrganizerPayout {
  return {
    id: api.id,
    provider: api.provider,
    isActive: api.isActive,
    bankName: api.bankName,
    accountNumber: api.accountNumber,
    accountType: api.accountType,
    accountHolder: api.accountHolder,
    holderIdentification: api.holderIdentification,
    receiverIdentifier: api.receiverIdentifier,
    verifiedAt: api.verifiedAt ? new Date(api.verifiedAt) : null,
  }
}

export function toOrganizerDetail(api: IApiOrganizerDetail): IOrganizerDetail {
  return {
    id: api.id,
    name: api.name,
    publicName: api.publicName,
    watermarkUrl: api.watermarkUrl,
    whatsappNumber: api.whatsappNumber,
    whatsappVerified: api.whatsappVerified,
    holderName: api.holderName,
    holderEmail: api.holderEmail,
    holderEmailVerified: api.holderEmailVerified,
    accountCount: api.accountCount,
    createdAt: new Date(api.createdAt),
    state: api.state,
    available: api.available,
    totalCapacity: api.totalCapacity,
    usedCapacity: api.usedCapacity,
    validContractCount: api.validContractCount,
    nextExpiry: api.nextExpiry,
    lostSlots: api.lostSlots,
    photosPerEventInUse: api.photosPerEventInUse,
    photoLimitsDiffer: api.photoLimitsDiffer,
    eventCount: api.eventCount,
    lastEventAt: api.lastEventAt ? new Date(api.lastEventAt) : null,
    defaultEventPhotoQuota: api.defaultEventPhotoQuota,
    contracts: api.contracts.map(toOrganizerContract),
    payouts: api.payouts.map(toOrganizerPayout),
  }
}
