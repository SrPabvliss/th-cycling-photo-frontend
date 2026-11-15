import { describe, expect, it } from 'vitest'
import { AxiosError, type AxiosResponse } from 'axios'

import { shouldRetryQuery } from './query-retry'

function httpError(status: number): AxiosError {
  const response = { status, data: {}, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, response)
}

describe('shouldRetryQuery', () => {
  it('does not retry what the server rejected as the client fault', () => {
    expect(shouldRetryQuery(0, httpError(404))).toBe(false)
    expect(shouldRetryQuery(0, httpError(400))).toBe(false)
    expect(shouldRetryQuery(0, httpError(499))).toBe(false)
  })

  it('retries a server failure once', () => {
    expect(shouldRetryQuery(0, httpError(500))).toBe(true)
    expect(shouldRetryQuery(1, httpError(500))).toBe(false)
  })

  it('retries once when the request never got an answer', () => {
    expect(shouldRetryQuery(0, new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(true)
    expect(shouldRetryQuery(0, new Error('network'))).toBe(true)
    expect(shouldRetryQuery(1, new Error('network'))).toBe(false)
  })

  it('does not retry a request that ran out of time: the screen offers it, after one wait', () => {
    expect(shouldRetryQuery(0, new AxiosError('timeout of 20000ms exceeded', 'ECONNABORTED'))).toBe(
      false,
    )
    expect(shouldRetryQuery(0, new AxiosError('timeout', 'ETIMEDOUT'))).toBe(false)
  })
})
