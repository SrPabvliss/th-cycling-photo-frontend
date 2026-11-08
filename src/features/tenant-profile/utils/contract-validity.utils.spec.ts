import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  findLastExpiry,
  hasEventsLeft,
  isContractInForce,
  readContractBlockReason,
} from './contract-validity.utils'

const ACCEPTED = {
  status: 'accepted' as const,
  eventsTotal: 1,
  eventsUsed: 0,
  validUntil: new Date(2026, 8, 5, 12),
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 8, 1, 14, 58))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('isContractInForce', () => {
  it('keeps a contract that expires today in force for the whole day', () => {
    expect(isContractInForce({ ...ACCEPTED, validUntil: new Date(2026, 8, 1, 12) })).toBe(true)
  })

  it('drops a contract that expired yesterday', () => {
    expect(isContractInForce({ ...ACCEPTED, validUntil: new Date(2026, 7, 31, 12) })).toBe(false)
  })

  it('does not count a contract that was never accepted', () => {
    expect(isContractInForce({ ...ACCEPTED, status: 'pending' })).toBe(false)
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

describe('readContractBlockReason', () => {
  it('reports nothing blocking while a contract in force still has events', () => {
    expect(readContractBlockReason([ACCEPTED])).toBe('none')
  })

  it('prefers a usable contract over an exhausted one', () => {
    expect(readContractBlockReason([{ ...ACCEPTED, eventsUsed: 1 }, ACCEPTED])).toBe('none')
  })

  it('separates a used-up contract from a lapsed one', () => {
    expect(readContractBlockReason([{ ...ACCEPTED, eventsUsed: 1 }])).toBe('exhausted')
  })

  it('reports expiry when every accepted contract is past its date', () => {
    expect(readContractBlockReason([{ ...ACCEPTED, validUntil: new Date(2026, 7, 20) }])).toBe(
      'expired',
    )
  })

  it('reports expiry for a contract the backend already marked as expired', () => {
    expect(readContractBlockReason([{ ...ACCEPTED, status: 'expired' }])).toBe('expired')
  })

  it('reports a contract waiting to be accepted', () => {
    expect(readContractBlockReason([{ ...ACCEPTED, status: 'pending' }])).toBe('pending')
  })

  it('does not point to a pending contract whose link already lapsed', () => {
    expect(
      readContractBlockReason([
        { ...ACCEPTED, status: 'pending', validUntil: new Date(2026, 7, 20) },
      ]),
    ).toBe('missing')
  })

  it('reports a missing contract when there is none or only revoked ones', () => {
    expect(readContractBlockReason([])).toBe('missing')
    expect(readContractBlockReason([{ ...ACCEPTED, status: 'revoked' }])).toBe('missing')
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
