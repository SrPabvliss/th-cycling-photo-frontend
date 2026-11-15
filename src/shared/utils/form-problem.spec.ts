import { afterEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosResponse } from 'axios'

import {
  generalProblem,
  NETWORK_PROBLEM,
  OFFLINE_PROBLEM,
  TOO_MANY_PROBLEM,
  UNKNOWN_PROBLEM,
} from './form-problem'

function answered(status: number): AxiosError {
  const response = { status, data: {}, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, response)
}

describe('generalProblem', () => {
  afterEach(() => vi.restoreAllMocks())

  it('says there is no internet, in amber, when the device is offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    expect(generalProblem(new AxiosError('Network Error', 'ERR_NETWORK'))).toEqual(OFFLINE_PROBLEM)
    expect(OFFLINE_PROBLEM).toEqual({ title: 'Sin conexión a internet', tone: 'warn' })
  })

  it('reads a failed trip or a server failure as not sent, in amber', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    expect(generalProblem(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(NETWORK_PROBLEM)
    expect(generalProblem(answered(503))).toBe(NETWORK_PROBLEM)
    expect(NETWORK_PROBLEM.tone).toBe('warn')
  })

  it('asks to wait after too many tries, in amber', () => {
    expect(generalProblem(answered(429))).toBe(TOO_MANY_PROBLEM)
    expect(TOO_MANY_PROBLEM.tone).toBe('warn')
  })

  it('reads anything the server refused as a refusal, in red', () => {
    expect(generalProblem(answered(409))).toBe(UNKNOWN_PROBLEM)
    expect(UNKNOWN_PROBLEM.tone).toBe('bad')
  })
})
