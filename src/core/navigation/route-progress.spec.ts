import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { registerRouteProgress, routeProgressActive } from './route-progress'

const Stub = { render: () => null }

function deferred<T>() {
  let resolve: (value: T) => void = () => {}
  let reject: (reason: unknown) => void = () => {}
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/** Lets the router run its guards up to the lazy component that is still loading. */
function guardsReached(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve))
}

async function buildRouter(lazy: () => Promise<unknown> = async () => Stub): Promise<Router> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/gallery', component: Stub },
      { path: '/lazy', component: lazy as () => Promise<typeof Stub> },
      { path: '/blocked', component: Stub, beforeEnter: () => false },
      { path: '/moved', component: Stub, beforeEnter: () => '/gallery' },
    ],
  })
  registerRouteProgress(router)
  await router.push('/')
  return router
}

describe('registerRouteProgress', () => {
  it('is on while the next screen loads and off once it is there', async () => {
    const chunk = deferred<typeof Stub>()
    const router = await buildRouter(() => chunk.promise)

    const navigation = router.push('/lazy')
    await guardsReached()
    expect(routeProgressActive.value).toBe(true)

    chunk.resolve(Stub)
    await navigation
    expect(routeProgressActive.value).toBe(false)
  })

  it('ends off when a guard cancels the navigation', async () => {
    const router = await buildRouter()

    await router.push('/blocked')

    expect(router.currentRoute.value.path).toBe('/')
    expect(routeProgressActive.value).toBe(false)
  })

  it('ends off when a guard redirects', async () => {
    const router = await buildRouter()

    await router.push('/moved')

    expect(router.currentRoute.value.path).toBe('/gallery')
    expect(routeProgressActive.value).toBe(false)
  })

  it('ends off when the next screen fails to load', async () => {
    const chunk = deferred<typeof Stub>()
    const router = await buildRouter(() => chunk.promise)
    router.onError(() => {})

    const navigation = router.push('/lazy')
    await guardsReached()
    expect(routeProgressActive.value).toBe(true)

    chunk.reject(new Error('chunk missing'))
    await navigation.catch(() => {})

    expect(routeProgressActive.value).toBe(false)
  })

  it('stays off when only the query changes', async () => {
    const router = await buildRouter()
    let wasActive = false
    router.beforeResolve(() => {
      wasActive = routeProgressActive.value
    })

    await router.push({ path: '/', query: { page: '2' } })

    expect(wasActive).toBe(false)
    expect(routeProgressActive.value).toBe(false)
  })

  it('stays off when only the hash changes', async () => {
    const router = await buildRouter()
    let wasActive = false
    router.beforeResolve(() => {
      wasActive = routeProgressActive.value
    })

    await router.push({ path: '/', hash: '#about' })

    expect(wasActive).toBe(false)
  })
})
