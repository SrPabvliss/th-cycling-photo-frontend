import { beforeEach, describe, expect, it, vi } from 'vitest'

import { cardPaymentEvent, rememberCardPaymentEvent } from './card-payment-event'

describe('card payment event', () => {
  beforeEach(() => sessionStorage.clear())

  it('remembers which event the card orders belong to, for the way back', () => {
    rememberCardPaymentEvent(['o1', 'o2'], 'e1')

    expect(cardPaymentEvent(['o1', 'o2'])).toBe('e1')
  })

  it('knows nothing about other orders', () => {
    rememberCardPaymentEvent(['o1'], 'e1')

    expect(cardPaymentEvent(['o9'])).toBeNull()
    expect(cardPaymentEvent([])).toBeNull()
  })

  it('works without storage', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => rememberCardPaymentEvent(['o1'], 'e1')).not.toThrow()
    expect(cardPaymentEvent(['o1'])).toBeNull()
    spy.mockRestore()
    vi.restoreAllMocks()
  })
})
