import { describe, expect, it } from 'vitest'

import {
  findLastExpiry,
  hasEventsLeft,
  isContractCurrentlyValid,
  readContractBlockReason,
} from './contract-validity.utils'

const NOW = new Date(2026, 8, 1, 14, 58)

describe('isContractCurrentlyValid', () => {
  it('keeps a contract that expires today valid for the whole day', () => {
    expect(isContractCurrentlyValid({ validUntil: new Date(2026, 8, 1, 12, 0) }, NOW)).toBe(true)
  })

  it('keeps a contract that expires later valid', () => {
    expect(isContractCurrentlyValid({ validUntil: new Date(2026, 8, 5, 12, 0) }, NOW)).toBe(true)
  })

  it('treats a contract that expired yesterday as no longer valid', () => {
    expect(isContractCurrentlyValid({ validUntil: new Date(2026, 7, 31, 12, 0) }, NOW)).toBe(false)
  })
})

describe('hasEventsLeft', () => {
  it('reports capacity while used stays under the total', () => {
    expect(hasEventsLeft({ eventsTotal: 1, eventsUsed: 0 })).toBe(true)
  })

  it('reports no capacity once used reaches the total', () => {
    expect(hasEventsLeft({ eventsTotal: 1, eventsUsed: 1 })).toBe(false)
  })
})

const ACCEPTED = {
  status: 'accepted' as const,
  eventsTotal: 1,
  eventsUsed: 0,
  validUntil: new Date(2026, 8, 5),
}

describe('readContractBlockReason', () => {
  it('reports nothing blocking while a valid contract still has events', () => {
    expect(readContractBlockReason([ACCEPTED], NOW)).toBe('none')
  })

  it('separates an exhausted contract from an expired one', () => {
    expect(readContractBlockReason([{ ...ACCEPTED, eventsUsed: 1 }], NOW)).toBe('exhausted')
  })

  it('reports expiry when every accepted contract is past its date', () => {
    expect(readContractBlockReason([{ ...ACCEPTED, validUntil: new Date(2026, 7, 20) }], NOW)).toBe(
      'expired',
    )
  })

  it('prefers a usable contract over an exhausted one', () => {
    const contracts = [{ ...ACCEPTED, eventsUsed: 1 }, ACCEPTED]
    expect(readContractBlockReason(contracts, NOW)).toBe('none')
  })

  it('reports a missing contract when none was ever accepted', () => {
    expect(readContractBlockReason([{ ...ACCEPTED, status: 'revoked' }], NOW)).toBe('missing')
  })
})

describe('findLastExpiry', () => {
  it('returns the furthest expiry among accepted contracts', () => {
    const contracts = [ACCEPTED, { ...ACCEPTED, validUntil: new Date(2026, 8, 20) }]
    expect(findLastExpiry(contracts)).toEqual(new Date(2026, 8, 20))
  })

  it('returns nothing when no contract was accepted', () => {
    expect(findLastExpiry([{ ...ACCEPTED, status: 'revoked' }])).toBeNull()
  })
})

describe('readContractBlockReason with nothing accepted', () => {
  it('separates a contract still waiting to be accepted from having none at all', () => {
    expect(readContractBlockReason([{ ...ACCEPTED, status: 'pending' }], NOW)).toBe('pending')
  })

  it('reports a revoked-only history as having no contract', () => {
    expect(readContractBlockReason([{ ...ACCEPTED, status: 'revoked' }], NOW)).toBe('missing')
  })
})
