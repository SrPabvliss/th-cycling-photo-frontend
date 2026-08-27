import { parseDateOnly } from '@/shared/utils/date.utils'
import type {
  ContractStatus,
  IApiContractListItem,
  IContractListItem,
} from '../types/responses/contract-list.response'

export function toContractListItem(api: IApiContractListItem): IContractListItem {
  return {
    id: api.id,
    commercialName: api.commercialName,
    eventsTotal: api.eventsTotal,
    eventsUsed: api.eventsUsed,
    photosPerEvent: api.photosPerEvent,
    status: api.status as ContractStatus,
    validUntil: parseDateOnly(api.validUntil),
    termsVersion: api.termsVersion,
    acceptedAt: api.acceptedAt ? new Date(api.acceptedAt) : null,
    holderEmail: api.holderEmail,
    holderName: api.holderName,
    isBackfill: api.isBackfill,
  }
}

export function toContractListItems(items: IApiContractListItem[]): IContractListItem[] {
  return items.map(toContractListItem)
}
