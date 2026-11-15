import { describe, expect, it } from 'vitest'

import { LATE_AFTER_MS, paymentOutcome } from './payment-outcome'

describe('paymentOutcome', () => {
  it('waits ten seconds for an answer before calling it late', () => {
    expect(LATE_AFTER_MS).toBe(10_000)
    expect(paymentOutcome(null, 0, false)).toBe('confirming')
    expect(paymentOutcome(null, 9_999, false)).toBe('confirming')
    expect(paymentOutcome(null, 10_000, false)).toBe('late')
  })

  it('confirms only a charge that was approved and settled', () => {
    expect(paymentOutcome({ approved: true, settled: true }, 0, false)).toBe('confirmed')
  })

  it('never confirms an approved charge that was not settled', () => {
    expect(paymentOutcome({ approved: true, settled: false }, 0, false)).toBe('late')
    expect(paymentOutcome({ approved: true, settled: false }, 60_000, false)).toBe('late')
  })

  // The charge went through for an order that no longer took it: Titan TV gives the money back.
  it('says a charge approved for an order that no longer took it is to be refunded', () => {
    const refund = { reason: 'order_cancelled' as const }
    expect(paymentOutcome({ approved: true, settled: false, refund }, 0, false)).toBe('refunded')
    expect(paymentOutcome({ approved: true, settled: false, refund: null }, 0, false)).toBe('late')
  })

  it('declines a charge the gateway did not approve', () => {
    expect(paymentOutcome({ approved: false, settled: false }, 0, false)).toBe('declined')
  })

  it.each(['declined', 'expired', 'reversed', 'cancelled'])(
    'declines a transaction in state %s',
    (status) => {
      expect(paymentOutcome({ status }, 0, false)).toBe('declined')
    },
  )

  it('confirms an approved transaction', () => {
    expect(paymentOutcome({ status: 'approved' }, 0, false)).toBe('confirmed')
  })

  it.each(['initiated', 'confirming'])('keeps waiting on a transaction in state %s', (status) => {
    expect(paymentOutcome({ status }, 0, false)).toBe('confirming')
    expect(paymentOutcome({ status }, 10_000, false)).toBe('late')
  })

  it('fails when the request failed and nothing is known', () => {
    expect(paymentOutcome(null, 0, true)).toBe('failed')
    expect(paymentOutcome(null, 30_000, true)).toBe('failed')
  })

  it('trusts an answer over a failed request', () => {
    expect(paymentOutcome({ approved: false, settled: false }, 0, true)).toBe('declined')
  })
})
