import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { AxiosError, type AxiosResponse } from 'axios'
import { defineComponent, ref } from 'vue'

import { useDeliveryQuery } from './use-delivery'

const get = vi.fn()
vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

const MINUTE = 60_000
const DATA = {
  data: {
    token: 't',
    eventName: 'x',
    customerName: 'y',
    status: 'active',
    expiresAt: '2026-12-13T00:00:00.000Z',
    downloadCount: 0,
    photos: [],
  },
}

let api!: ReturnType<typeof useDeliveryQuery>
let wrapper: ReturnType<typeof mount> | null = null
async function start() {
  wrapper = mount(
    defineComponent({
      setup() {
        api = useDeliveryQuery(ref('tok'))
        return () => null
      },
    }),
    {
      global: {
        plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]],
      },
    },
  )
  await flushPromises()
}

// Leaves the tab and comes back, the way both the page and the query library hear it.
function returnToTab() {
  for (const value of ['hidden', 'visible'] as const) {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => value })
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
    window.dispatchEvent(new Event('visibilitychange'))
  }
  window.dispatchEvent(new Event('focus'))
}

describe('useDeliveryQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    get.mockReset()
    get.mockResolvedValue(DATA)
  })
  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.useRealTimers()
  })

  it('does not spend an access on each return to the tab within the hour', async () => {
    await start()
    expect(get).toHaveBeenCalledTimes(1)

    for (let turn = 0; turn < 10; turn += 1) {
      await vi.advanceTimersByTimeAsync(5 * MINUTE)
      returnToTab()
      await flushPromises()
    }

    expect(get).toHaveBeenCalledTimes(1)
  })

  it('asks once more on returning to the tab when the addresses are about to expire', async () => {
    await start()

    await vi.advanceTimersByTimeAsync(56 * MINUTE)
    returnToTab()
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(2)
  })

  it('reads again only when the addresses are older than 55 minutes', async () => {
    await start()

    await vi.advanceTimersByTimeAsync(10 * MINUTE)
    await api.ensureFresh()
    expect(get).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(46 * MINUTE)
    await api.ensureFresh()
    expect(get).toHaveBeenCalledTimes(2)
  })

  it('does not try again by itself after a failure', async () => {
    const response = { status: 500, data: {}, headers: {}, config: {} } as AxiosResponse
    get.mockRejectedValue(new AxiosError('x', 'ERR_BAD_RESPONSE', undefined, undefined, response))
    await start()

    await vi.advanceTimersByTimeAsync(10 * MINUTE)
    returnToTab()
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(1)
    expect(api.problem.value).toBe('unknown')
  })
})
