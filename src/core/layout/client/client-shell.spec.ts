import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import appRouter from '@/app/router'
import { resolveClientShell, type IClientShell } from './client-shell'

const Stub = { render: () => null }

const DEFAULT_SHELL: IClientShell = { tab: null, tabBar: false, header: true, footer: true }

describe('resolveClientShell', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/plain', component: Stub },
      {
        path: '/parent',
        component: Stub,
        meta: { shell: { tab: 'events', tabBar: true } },
        children: [
          { path: 'inherits', component: Stub },
          { path: 'replaces', component: Stub, meta: { shell: { footer: false } } },
        ],
      },
    ],
  })

  it('gives a route without shell meta the default shell: header and footer, no tab bar', () => {
    expect(resolveClientShell(router.resolve('/plain'))).toEqual(DEFAULT_SHELL)
  })

  it('fills what a route leaves out with the defaults', () => {
    expect(resolveClientShell(router.resolve('/parent'))).toEqual({
      tab: 'events',
      tabBar: true,
      header: true,
      footer: true,
    })
  })

  it('lets a child inherit the shell of its parent', () => {
    expect(resolveClientShell(router.resolve('/parent/inherits'))).toEqual({
      tab: 'events',
      tabBar: true,
      header: true,
      footer: true,
    })
  })

  it('replaces the shell of the parent, not merges it, when the child declares its own', () => {
    expect(resolveClientShell(router.resolve('/parent/replaces'))).toEqual({
      tab: null,
      tabBar: false,
      header: true,
      footer: false,
    })
  })
})

describe('the shell each client route of the app asks for', () => {
  const uuid = '3f0c8f5e-1c1d-4b7a-9a52-0e3d5c7b9a10'

  const cases: [path: string, shell: IClientShell][] = [
    ['/', { tab: 'home', tabBar: true, header: true, footer: true }],
    ['/gallery', { tab: 'events', tabBar: true, header: true, footer: true }],
    ['/gallery/vuelta-al-cotopaxi', { tab: 'events', tabBar: false, header: true, footer: false }],
    ['/account/orders', { tab: 'photos', tabBar: true, header: true, footer: true }],
    [`/account/orders/${uuid}`, { tab: 'photos', tabBar: false, header: true, footer: false }],
    ['/account/profile', { tab: 'home', tabBar: false, header: true, footer: false }],
    ['/account/verify-email', { tab: null, tabBar: false, header: true, footer: false }],
    ['/login', { tab: null, tabBar: false, header: true, footer: false }],
    ['/register', { tab: null, tabBar: false, header: true, footer: false }],
    ['/forgot-password', { tab: null, tabBar: false, header: true, footer: false }],
    ['/reset-password', { tab: null, tabBar: false, header: true, footer: false }],
    [`/checkout/${uuid}`, { tab: null, tabBar: false, header: true, footer: false }],
    ['/checkout/payment', { tab: null, tabBar: false, header: true, footer: false }],
    ['/checkout/payphone/return', { tab: null, tabBar: false, header: true, footer: false }],
    ['/preview/some-token', { tab: null, tabBar: false, header: false, footer: false }],
    ['/delivery/some-token', { tab: null, tabBar: false, header: false, footer: false }],
    ['/privacy', DEFAULT_SHELL],
    ['/terms', DEFAULT_SHELL],
    ['/tenant-terms', DEFAULT_SHELL],
    ['/404', DEFAULT_SHELL],
    ['/500', DEFAULT_SHELL],
    ['/access-denied', DEFAULT_SHELL],
  ]

  it.each(cases)('%s', (path, shell) => {
    const route = appRouter.resolve(path)

    expect(route.matched.length).toBeGreaterThan(0)
    expect(route.name).not.toBeUndefined()
    expect(resolveClientShell(route)).toEqual(shell)
  })
})
