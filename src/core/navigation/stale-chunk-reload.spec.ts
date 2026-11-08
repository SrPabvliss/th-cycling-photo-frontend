import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import {
  registerStaleChunkReload,
  reloadOnceForStaleChunk,
  STALE_CHUNK_RELOAD_KEY,
  STALE_CHUNK_RELOAD_WINDOW_MS,
} from './stale-chunk-reload'

const assign = vi.fn()
const reload = vi.fn()
const realLocation = window.location

function firePreloadError() {
  window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }))
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 10, 8, 10, 0))
  window.sessionStorage.clear()
  assign.mockClear()
  reload.mockClear()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...realLocation, assign, reload },
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  Object.defineProperty(window, 'location', { configurable: true, value: realLocation })
})

describe('reloadOnceForStaleChunk', () => {
  it('reloads the current page when no navigation is underway', () => {
    expect(reloadOnceForStaleChunk(null)).toBe(true)

    expect(reload).toHaveBeenCalledTimes(1)
    expect(assign).not.toHaveBeenCalled()
  })

  it('lands on the page the navigation was heading to', () => {
    reloadOnceForStaleChunk('/gallery/vuelta-2026?bib=12')

    expect(assign).toHaveBeenCalledWith('/gallery/vuelta-2026?bib=12')
    expect(reload).not.toHaveBeenCalled()
  })

  it('does not reload again right after a reload, so a gone chunk cannot loop', () => {
    reloadOnceForStaleChunk(null)
    vi.advanceTimersByTime(STALE_CHUNK_RELOAD_WINDOW_MS - 1)

    expect(reloadOnceForStaleChunk(null)).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('reloads again for a later deploy once the window has passed', () => {
    reloadOnceForStaleChunk(null)
    vi.advanceTimersByTime(STALE_CHUNK_RELOAD_WINDOW_MS)

    expect(reloadOnceForStaleChunk(null)).toBe(true)
    expect(reload).toHaveBeenCalledTimes(2)
  })

  it('ignores a stored mark that is not a time', () => {
    window.sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, 'basura')

    expect(reloadOnceForStaleChunk(null)).toBe(true)
  })

  it('does not reload when it cannot remember having reloaded', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(reloadOnceForStaleChunk(null)).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })
})

describe('registerStaleChunkReload', () => {
  function makeRouter() {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/gallery/:slug', component: { template: '<div />' } },
      ],
    })
    registerStaleChunkReload(router)
    return router
  }

  it('reloads onto the destination when a route chunk fails mid-navigation', async () => {
    const router = makeRouter()
    await router.push('/')
    router.beforeEach(() => {
      firePreloadError()
      return false
    })

    await router.push('/gallery/vuelta-2026')

    expect(assign).toHaveBeenCalledWith('/gallery/vuelta-2026')
  })

  it('reloads the current page when a chunk fails outside a navigation', async () => {
    const router = makeRouter()
    await router.push('/')

    firePreloadError()

    expect(reload).toHaveBeenCalledTimes(1)
    expect(assign).not.toHaveBeenCalled()
  })
})
