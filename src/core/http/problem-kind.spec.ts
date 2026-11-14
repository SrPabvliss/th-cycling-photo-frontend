import { afterEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosResponse } from 'axios'

import { problemKind } from './problem-kind'
import { SessionExpiredError } from './session-expired'

function answered(status: number): AxiosError {
  const response = { status, data: {}, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, response)
}

function setOnline(online: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online)
}

describe('problemKind', () => {
  afterEach(() => vi.restoreAllMocks())

  it('is offline when nothing answered and the device has no network', () => {
    setOnline(false)

    expect(problemKind(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe('offline')
    expect(problemKind(new TypeError('Failed to fetch'))).toBe('offline')
  })

  it('is the server, not the network, when nothing answered but the device is online', () => {
    setOnline(true)

    expect(problemKind(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe('server')
  })

  it('is a timeout when the request gave up waiting', () => {
    setOnline(true)

    expect(problemKind(new AxiosError('timeout of 30000ms exceeded', 'ECONNABORTED'))).toBe(
      'timeout',
    )
    expect(problemKind(new AxiosError('timeout', 'ETIMEDOUT'))).toBe('timeout')
  })

  it('is the server when it answered with a 5xx', () => {
    setOnline(true)

    expect(problemKind(answered(500))).toBe('server')
    expect(problemKind(answered(503))).toBe('server')
  })

  it('is rate when the server asks to slow down', () => {
    expect(problemKind(answered(429))).toBe('rate')
  })

  it('is expired when the session could not be renewed', () => {
    setOnline(false)

    expect(problemKind(new SessionExpiredError())).toBe('expired')
  })

  it('is unknown for anything else', () => {
    setOnline(true)

    expect(problemKind(answered(404))).toBe('unknown')
    expect(problemKind(answered(422))).toBe('unknown')
    expect(problemKind(new Error('boom'))).toBe('unknown')
    expect(problemKind(undefined)).toBe('unknown')
  })
})
