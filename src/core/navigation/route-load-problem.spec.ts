import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

const online = vi.hoisted(() => ({ value: true }))
vi.mock('@tanstack/vue-query', () => ({ onlineManager: { isOnline: () => online.value } }))

import {
  isChunkLoadError,
  registerRouteLoadProblems,
  retryRouteLoad,
  routeLoadProblem,
} from './route-load-problem'

const chunkError = () =>
  new TypeError('Failed to fetch dynamically imported module: http://x/src/Pay.vue')

function makeRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/checkout', component: { template: '<div />' } },
      { path: '/checkout/method', component: () => Promise.reject(chunkError()) },
      { path: '/gallery', component: { template: '<div />' } },
    ],
  })
  registerRouteLoadProblems(router)
  return router
}

describe('route load problems', () => {
  beforeEach(() => {
    online.value = true
    routeLoadProblem.value = null
  })
  afterEach(() => vi.restoreAllMocks())

  it('knows a route chunk that could not be fetched from any other error', () => {
    expect(isChunkLoadError(chunkError())).toBe(true)
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isChunkLoadError(new Error('boom'))).toBe(false)
    expect(isChunkLoadError(undefined)).toBe(false)
  })

  it('without network, cancels the navigation and leaves the person where they are, quietly', async () => {
    online.value = false
    const router = makeRouter()
    await router.push('/checkout')

    await router.push('/checkout/method').catch(() => undefined)

    expect(router.currentRoute.value.fullPath).toBe('/checkout')
    expect(routeLoadProblem.value).toBeNull()
  })

  it('with network, says the page could not open and offers to load it again', async () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign })
    const router = makeRouter()
    await router.push('/checkout')

    await router.push('/checkout/method').catch(() => undefined)

    expect(router.currentRoute.value.fullPath).toBe('/checkout')
    expect(routeLoadProblem.value).toEqual({ target: '/checkout/method' })
    retryRouteLoad()
    expect(assign).toHaveBeenCalledWith('/checkout/method')
    vi.unstubAllGlobals()
  })

  it('forgets the problem once another navigation works', async () => {
    const router = makeRouter()
    await router.push('/checkout')
    await router.push('/checkout/method').catch(() => undefined)

    await router.push('/gallery')

    expect(routeLoadProblem.value).toBeNull()
  })

  it('leaves no unhandled rejection behind for a chunk that could not be fetched', () => {
    makeRouter()
    const chunk = new Event('unhandledrejection', { cancelable: true }) as Event & {
      reason?: unknown
    }
    chunk.reason = chunkError()
    const other = new Event('unhandledrejection', { cancelable: true }) as Event & {
      reason?: unknown
    }
    other.reason = new Error('boom')

    window.dispatchEvent(chunk)
    window.dispatchEvent(other)

    expect(chunk.defaultPrevented).toBe(true)
    expect(other.defaultPrevented).toBe(false)
  })
})
