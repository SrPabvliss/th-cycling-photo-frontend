import { parseDateOnly } from '@/shared/utils/date.utils'
import type { IApiContractOffer, IContractOffer } from '../types/responses/contract-offer.response'

export function toContractOffer(api: IApiContractOffer): IContractOffer {
  return {
    id: api.id,
    commercialName: api.commercialName,
    eventsTotal: api.eventsTotal,
    photosPerEvent: api.photosPerEvent,
    validUntil: api.validUntil ? parseDateOnly(api.validUntil) : null,
    termsVersion: api.termsVersion,
    status: api.status,
    blockedReason: api.blockedReason,
  }
}
