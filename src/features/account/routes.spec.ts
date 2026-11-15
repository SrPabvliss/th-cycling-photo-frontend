import { describe, expect, it } from 'vitest'

import { ACCOUNT_ROUTE_NAMES, accountRoutes } from './routes'

describe('account routes', () => {
  // "Mi perfil" is in no destination of the navigation: none is marked as the current page.
  it('marks no navigation destination as current on the profile', () => {
    const profile = accountRoutes.find((route) => route.name === ACCOUNT_ROUTE_NAMES.PROFILE)!

    expect((profile.meta?.shell as { tab?: string } | undefined)?.tab).toBeUndefined()
  })
})
