import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { createPinia, setActivePinia } from 'pinia'

import { registerAuthInterceptor } from './auth.interceptor'

vi.mock('@/app/router', () => ({
  default: {
    currentRoute: { value: { matched: [{}], meta: { public: true }, fullPath: '/login' } },
    resolve: vi.fn(),
    push: vi.fn(),
  },
}))

const calls: string[] = []
const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  calls.push(config.url ?? '')
  const response = { status: 401, statusText: '', data: {}, headers: {}, config }
  throw new AxiosError('unauthorized', 'ERR_BAD_REQUEST', config, undefined, response)
}

function client() {
  const instance = axios.create({ adapter })
  registerAuthInterceptor(instance)
  return instance
}

describe('auth interceptor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    calls.length = 0
  })

  it('tries to renew the session on a 401', async () => {
    await expect(client().get('/orders/me')).rejects.toBeTruthy()

    expect(calls).toEqual(['/orders/me', '/auth/refresh'])
  })

  it('leaves a 401 alone when the request asks for it (rejected credentials)', async () => {
    const error = await client()
      .post('/auth/login', {}, { skipAuthRetry: true } as never)
      .catch((reason: unknown) => reason)

    expect(calls).toEqual(['/auth/login'])
    expect((error as AxiosError).response?.status).toBe(401)
  })
})
