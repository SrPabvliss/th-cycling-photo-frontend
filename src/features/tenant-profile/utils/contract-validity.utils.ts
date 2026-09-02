import type { IContractListItem } from '../types/responses/contract-list.response'

export function isContractCurrentlyValid(
  contract: Pick<IContractListItem, 'validUntil'>,
  now: Date = new Date(),
): boolean {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  return contract.validUntil >= startOfToday
}

export function hasEventsLeft(
  contract: Pick<IContractListItem, 'eventsTotal' | 'eventsUsed'>,
): boolean {
  return contract.eventsUsed < contract.eventsTotal
}

export type ContractBlockReason = 'none' | 'exhausted' | 'expired' | 'pending' | 'missing'

export function readContractBlockReason(
  contracts: Pick<IContractListItem, 'status' | 'validUntil' | 'eventsTotal' | 'eventsUsed'>[],
  now: Date = new Date(),
): ContractBlockReason {
  const accepted = contracts.filter((contract) => contract.status === 'accepted')
  if (accepted.length === 0) {
    return contracts.some((contract) => contract.status === 'pending') ? 'pending' : 'missing'
  }

  const valid = accepted.filter((contract) => isContractCurrentlyValid(contract, now))
  if (valid.length === 0) return 'expired'

  return valid.some(hasEventsLeft) ? 'none' : 'exhausted'
}

export function findLastExpiry(
  contracts: Pick<IContractListItem, 'status' | 'validUntil'>[],
): Date | null {
  const dates = contracts
    .filter((contract) => contract.status === 'accepted')
    .map((contract) => contract.validUntil.getTime())

  return dates.length > 0 ? new Date(Math.max(...dates)) : null
}
