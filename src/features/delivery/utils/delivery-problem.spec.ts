import { describe, expect, it } from 'vitest'
import { AxiosError, type AxiosResponse } from 'axios'

import { deliveryProblem } from './delivery-problem'

function apiError(status: number, messageKey?: string) {
  const data = messageKey ? { error: { messageKey } } : {}
  const response = { status, data, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

describe('deliveryProblem', () => {
  it.each([
    [apiError(410, 'delivery.link_expired'), 'expired'],
    [apiError(410, 'delivery.access_limit_exceeded'), 'access-limit'],
    [apiError(404), 'not-found'],
    [apiError(429), 'rate-limited'],
    [new AxiosError('Network Error', 'ERR_NETWORK'), 'network'],
    [apiError(500), 'unknown'],
    [new Error('x'), 'unknown'],
  ])('reads %s as %s', (error, problem) => {
    expect(deliveryProblem(error)).toBe(problem)
  })
})
