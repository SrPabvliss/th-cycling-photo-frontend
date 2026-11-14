import { afterEach, describe, expect, it, vi } from 'vitest'

async function load(deviceOnline: boolean) {
  vi.resetModules()
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(deviceOnline)
  const { useOnline } = await import('./use-online')
  const { onlineManager } = await import('@tanstack/vue-query')
  return { online: useOnline(), onlineManager }
}

describe('useOnline', () => {
  afterEach(() => vi.restoreAllMocks())

  it('opens already offline when the device has no network, and vue-query knows it too', async () => {
    const { online, onlineManager } = await load(false)

    expect(online.value).toBe(false)
    expect(onlineManager.isOnline()).toBe(false)
  })

  it('comes back online with the device, for the screen and for vue-query alike', async () => {
    const { online, onlineManager } = await load(false)

    window.dispatchEvent(new Event('online'))

    expect(online.value).toBe(true)
    expect(onlineManager.isOnline()).toBe(true)
  })

  it('goes offline with the device', async () => {
    const { online, onlineManager } = await load(true)

    window.dispatchEvent(new Event('offline'))

    expect(online.value).toBe(false)
    expect(onlineManager.isOnline()).toBe(false)
  })

  it('follows vue-query, so the two can never disagree', async () => {
    const { online, onlineManager } = await load(true)

    onlineManager.setOnline(false)
    expect(online.value).toBe(false)

    onlineManager.setOnline(true)
    expect(online.value).toBe(true)
  })
})
