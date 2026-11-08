import { isOnOrAfterToday } from '@/shared/utils/date.utils'

import type { IContractListItem } from '../types/responses/contract-list.response'

type ContractValidity = Pick<IContractListItem, 'status' | 'validUntil'>
type ContractUsage = Pick<IContractListItem, 'eventsTotal' | 'eventsUsed'>

/** Why an organizer cannot create events right now. `none` means nothing is blocking. */
export type ContractBlockReason = 'none' | 'exhausted' | 'expired' | 'pending' | 'missing'

/** An accepted contract that has not lapsed yet. Its whole last day still counts. */
export function isContractInForce(contract: ContractValidity): boolean {
  return contract.status === 'accepted' && isOnOrAfterToday(contract.validUntil)
}

export function hasEventsLeft(contract: ContractUsage): boolean {
  return contract.eventsUsed < contract.eventsTotal
}

/**
 * Tells apart the reasons an organizer has no event quota, so the empty state can name the
 * real one: a used-up contract, a lapsed one, one still waiting to be accepted, or none at all.
 */
export function readContractBlockReason(
  contracts: (ContractValidity & ContractUsage)[],
): ContractBlockReason {
  const inForce = contracts.filter(isContractInForce)
  if (inForce.length > 0) return inForce.some(hasEventsLeft) ? 'none' : 'exhausted'

  const wasAccepted = contracts.some(
    (contract) => contract.status === 'accepted' || contract.status === 'expired',
  )
  if (wasAccepted) return 'expired'

  const awaitsAcceptance = contracts.some(
    (contract) => contract.status === 'pending' && isOnOrAfterToday(contract.validUntil),
  )
  return awaitsAcceptance ? 'pending' : 'missing'
}

/** The latest expiry among contracts the organizer accepted, or null when there is none. */
export function findLastExpiry(contracts: ContractValidity[]): Date | null {
  const dates = contracts
    .filter((contract) => contract.status === 'accepted' || contract.status === 'expired')
    .map((contract) => contract.validUntil.getTime())

  return dates.length > 0 ? new Date(Math.max(...dates)) : null
}
