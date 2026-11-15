import { describe, expect, it, vi } from 'vitest'
import { AxiosError } from 'axios'

import { paymentOptionsProblem } from './payment-options-problem'

describe('paymentOptionsProblem', () => {
  it('says the ways to pay could not be read, and why they matter', () => {
    vi.stubGlobal('navigator', { onLine: true })
    expect(paymentOptionsProblem('error', false, new AxiosError('down', 'ERR_NETWORK'))).toEqual({
      title: 'No pudimos mostrar las formas de pago',
      text: 'Las necesitamos para crear tu pedido.',
    })
    vi.unstubAllGlobals()
  })

  it('says it is slow when the request ran out of time', () => {
    expect(
      paymentOptionsProblem('error', false, new AxiosError('timeout', 'ECONNABORTED'))?.title,
    ).toBe('Está tardando más de lo normal')
  })

  it('says nothing while they load, once they are known, or when they are still known', () => {
    expect(paymentOptionsProblem('pending', false, null)).toBeNull()
    expect(paymentOptionsProblem('success', true, null)).toBeNull()
    expect(paymentOptionsProblem('error', true, new Error('refetch failed'))).toBeNull()
  })
})
