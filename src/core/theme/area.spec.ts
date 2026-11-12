import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { areaOfRoute, currentArea, registerUiArea } from './area'

const Stub = { render: () => null }

/** Lets the router run its guards up to the one that is still waiting. */
function guardsReached(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve))
}

function buildRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      {
        path: '/panel',
        component: Stub,
        meta: { area: 'panel' },
        children: [{ path: 'events', component: Stub }],
      },
      { path: '/review', component: Stub, meta: { area: 'panel' } },
    ],
  })
}

describe('areaOfRoute', () => {
  it('treats a route without area meta as client', () => {
    const router = buildRouter()
    expect(areaOfRoute(router.resolve('/'))).toBe('client')
  })

  it('inherits the panel area from a parent record', () => {
    const router = buildRouter()
    expect(areaOfRoute(router.resolve('/panel/events'))).toBe('panel')
  })

  it('reads the panel area from a top level record', () => {
    const router = buildRouter()
    expect(areaOfRoute(router.resolve('/review'))).toBe('panel')
  })
})

describe('registerUiArea', () => {
  let router: Router

  beforeEach(async () => {
    delete document.documentElement.dataset.ttArea
    router = buildRouter()
    registerUiArea(router)
    await router.push('/')
  })

  it('marks the panel on the root element when entering a panel route', async () => {
    await router.push('/panel/events')

    expect(currentArea.value).toBe('panel')
    expect(document.documentElement.dataset.ttArea).toBe('panel')
  })

  it('goes back to client when leaving the panel', async () => {
    await router.push('/panel/events')
    await router.push('/')

    expect(currentArea.value).toBe('client')
    expect(document.documentElement.dataset.ttArea).toBe('client')
  })
})

describe('registerUiArea on the first navigation', () => {
  function slowGuard(router: Router) {
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    router.beforeEach(async () => {
      await gate
    })
    return release
  }

  beforeEach(() => {
    delete document.documentElement.dataset.ttArea
  })

  it('marks the client area before a slow guard lets the first navigation through', async () => {
    const router = buildRouter()
    registerUiArea(router)
    const release = slowGuard(router)

    const navigation = router.push('/')
    await guardsReached()

    expect(document.documentElement.dataset.ttArea).toBe('client')

    release()
    await navigation
  })

  it('marks the panel area before a slow guard lets the first navigation through', async () => {
    const router = buildRouter()
    registerUiArea(router)
    const release = slowGuard(router)

    const navigation = router.push('/panel/events')
    await guardsReached()

    expect(currentArea.value).toBe('panel')
    expect(document.documentElement.dataset.ttArea).toBe('panel')

    release()
    await navigation
  })

  it('keeps the outgoing area on a later navigation until it finishes', async () => {
    const router = buildRouter()
    registerUiArea(router)
    await router.push('/')
    const release = slowGuard(router)

    const navigation = router.push('/panel/events')
    await guardsReached()

    expect(document.documentElement.dataset.ttArea).toBe('client')

    release()
    await navigation

    expect(document.documentElement.dataset.ttArea).toBe('panel')
  })

  it('ends in client when the first navigation to the panel is redirected to a client route', async () => {
    const router = buildRouter()
    registerUiArea(router)
    router.beforeEach((to) => (to.path === '/panel/events' ? '/' : true))

    await router.push('/panel/events')

    expect(currentArea.value).toBe('client')
    expect(document.documentElement.dataset.ttArea).toBe('client')
  })
})
