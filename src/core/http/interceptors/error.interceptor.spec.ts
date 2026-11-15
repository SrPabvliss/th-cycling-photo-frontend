import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

const message = vi.hoisted(() => ({ error: vi.fn() }))
vi.mock('@/core/ui/discrete-api', () => ({ message }))

import { SessionExpiredError } from '../session-expired'
import { registerErrorInterceptor } from './error.interceptor'

function failingWith(error: (config: InternalAxiosRequestConfig) => AxiosError) {
  const instance = axios.create({
    adapter: async (config) => {
      throw error(config)
    },
  })
  registerErrorInterceptor(instance)
  return instance
}

const answer = (status: number, data: unknown, config: InternalAxiosRequestConfig) =>
  ({ status, data, headers: {}, config, statusText: '' }) as AxiosResponse

describe('error interceptor', () => {
  beforeEach(() => message.error.mockReset())

  it('says what the api says when it says something', async () => {
    const instance = failingWith(
      (config) =>
        new AxiosError(
          'Request failed with status code 422',
          'ERR_BAD_REQUEST',
          config,
          null,
          answer(422, { error: { message: 'El evento no existe.' } }, config),
        ),
    )

    await expect(instance.get('/events/x')).rejects.toBeInstanceOf(AxiosError)
    expect(message.error).toHaveBeenCalledWith('El evento no existe.')
  })

  it('says in Spanish that there is no connection when nothing answered', async () => {
    const instance = failingWith((config) => new AxiosError('Network Error', 'ERR_NETWORK', config))

    await expect(instance.get('/cart')).rejects.toBeInstanceOf(AxiosError)
    expect(message.error).toHaveBeenCalledWith(
      'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
    )
  })

  it('says the same when the request ran out of time', async () => {
    const instance = failingWith(
      (config) => new AxiosError('timeout of 10000ms exceeded', 'ECONNABORTED', config),
    )

    await expect(instance.get('/cart')).rejects.toBeInstanceOf(AxiosError)
    expect(message.error).toHaveBeenCalledWith(
      'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
    )
  })

  it('never shows the English text of the http library for an answer with no message', async () => {
    const instance = failingWith(
      (config) =>
        new AxiosError(
          'Request failed with status code 500',
          'ERR_BAD_RESPONSE',
          config,
          null,
          answer(500, '<html>', config),
        ),
    )

    await expect(instance.get('/cart')).rejects.toBeInstanceOf(AxiosError)
    expect(message.error).toHaveBeenCalledWith('Algo salió mal. Inténtalo de nuevo.')
  })

  it('stays quiet for a silent request', async () => {
    const instance = failingWith((config) => new AxiosError('Network Error', 'ERR_NETWORK', config))

    await expect(instance.get('/cart', { silent: true } as object)).rejects.toBeInstanceOf(
      AxiosError,
    )
    expect(message.error).not.toHaveBeenCalled()
  })

  it('leaves an expired session to whoever shows it, with no toast of its own', async () => {
    const instance = axios.create({
      adapter: async () => {
        throw new SessionExpiredError()
      },
    })
    registerErrorInterceptor(instance)

    await expect(instance.get('/cart')).rejects.toBeInstanceOf(SessionExpiredError)
    expect(message.error).not.toHaveBeenCalled()
  })
})
