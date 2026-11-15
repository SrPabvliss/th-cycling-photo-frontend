import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

const area = vi.hoisted(() => ({ value: 'client' as 'client' | 'panel' }))
vi.mock('@/core/theme/area', () => ({ currentArea: area }))

import { CLIENT_REQUEST_TIMEOUT_MS, registerTimeoutInterceptor } from './timeout.interceptor'

// The timeout each request leaves with, as the adapter receives it.
function client() {
  const sent: InternalAxiosRequestConfig[] = []
  const instance = axios.create({
    adapter: async (config) => {
      sent.push(config)
      return { status: 200, data: {}, headers: {}, config, statusText: '' } as AxiosResponse
    },
  })
  registerTimeoutInterceptor(instance)
  return { instance, timeout: () => sent[sent.length - 1]?.timeout }
}

describe('timeout interceptor', () => {
  beforeEach(() => {
    area.value = 'client'
  })

  it('gives up on a client request after 20 seconds, so "taking longer than usual" can show', async () => {
    const { instance, timeout } = client()

    await instance.get('/public/events')
    expect(timeout()).toBe(20_000)
    expect(CLIENT_REQUEST_TIMEOUT_MS).toBe(20_000)

    await instance.post('/cart/items', { photoId: 'p1' })
    expect(timeout()).toBe(20_000)
  })

  it('leaves the organizer panel without a limit', async () => {
    area.value = 'panel'
    const { instance, timeout } = client()

    await instance.get('/events')

    expect(timeout()).toBe(0)
  })

  it('leaves uploads without a limit', async () => {
    const { instance, timeout } = client()

    await instance.post('/photos', new FormData())
    expect(timeout()).toBe(0)

    await instance.post('/photos', new Blob(['x']))
    expect(timeout()).toBe(0)

    await instance.post('/photos', { name: 'x' }, { onUploadProgress: () => {} })
    expect(timeout()).toBe(0)
  })

  it('leaves downloads without a limit', async () => {
    const { instance, timeout } = client()

    await instance.get('/orders/o1/zip', { responseType: 'blob' })
    expect(timeout()).toBe(0)

    await instance.get('/orders/o1/zip', { responseType: 'arraybuffer' })
    expect(timeout()).toBe(0)
  })

  it('keeps a limit the request set for itself', async () => {
    const { instance, timeout } = client()

    await instance.get('/public/events', { timeout: 5_000 })

    expect(timeout()).toBe(5_000)
  })
})
