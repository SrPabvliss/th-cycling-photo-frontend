import { describe, expect, it, vi } from 'vitest'
import axios from 'axios'

const message = vi.hoisted(() => ({ error: vi.fn() }))
vi.mock('@/core/ui/discrete-api', () => ({ message }))

import { SessionExpiredError } from '../session-expired'
import { registerErrorInterceptor } from './error.interceptor'

describe('error interceptor', () => {
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
