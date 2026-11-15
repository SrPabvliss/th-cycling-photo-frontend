import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useSessionStore } from './session.store'

const USER = {
  id: 'u1',
  email: 'a@b.c',
  firstName: 'Ana',
  lastName: null,
  role: 'customer',
  permissions: [],
  pendingConsents: [],
} as never

describe('session store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('remembers that the session expired, which is not the same as signing out', () => {
    const session = useSessionStore()
    session.setAccessToken('token')

    session.expireSession()

    expect(session.isAuthenticated).toBe(false)
    expect(session.expired).toBe(true)
  })

  it('forgets it on signing in again or on signing out', () => {
    const session = useSessionStore()
    session.expireSession()
    session.setSession('token', USER)
    expect(session.expired).toBe(false)

    session.expireSession()
    session.clearSession()
    expect(session.expired).toBe(false)
  })
})
