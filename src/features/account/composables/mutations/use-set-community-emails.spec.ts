import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'

const post = vi.fn()
const get = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: {
    post: (...args: unknown[]) => post(...args),
    get: (...args: unknown[]) => get(...args),
  },
}))

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useSetCommunityEmails } from './use-set-community-emails'
import { useUnsubscribeCommunityEmails } from './use-unsubscribe-community-emails'

function host<T>(use: () => T): T {
  let result!: T
  const Host = defineComponent({
    setup() {
      result = use()
      return () => null
    },
  })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]] } })
  return result
}

const ME = {
  id: 'u1',
  email: 'ana@correo.com',
  firstName: 'Ana',
  lastName: null,
  role: 'customer',
  communityEmailsAvailable: true,
}

function signIn(communityEmails: boolean) {
  useSessionStore().setSession('token', toCurrentUser({ ...ME, communityEmails } as never))
}

describe('useSetCommunityEmails', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    post.mockReset().mockResolvedValue({ data: null })
    get.mockReset()
  })

  it('records the consent to turn them on, and reads the session again', async () => {
    signIn(false)
    get.mockResolvedValue({ data: { ...ME, communityEmails: true, pendingPrompts: [] } })
    const mutation = host(() => useSetCommunityEmails())

    await mutation.mutateAsync(true)

    expect(post).toHaveBeenCalledWith(
      '/auth/consents',
      { types: ['community_emails'] },
      { silent: undefined },
    )
    expect(get).toHaveBeenCalledWith('/auth/me', { silent: true })
    expect(useSessionStore().currentUser?.communityEmails).toBe(true)
  })

  it('revokes the consent to turn them off', async () => {
    signIn(true)
    get.mockResolvedValue({ data: { ...ME, communityEmails: false } })
    const mutation = host(() => useSetCommunityEmails({ silent: true }))

    await mutation.mutateAsync(false)

    expect(post).toHaveBeenCalledWith(
      '/auth/consents/revoke',
      { types: ['community_emails'] },
      { silent: true },
    )
    expect(useSessionStore().currentUser?.communityEmails).toBe(false)
  })

  it('does not fail when only reading the session again fails', async () => {
    signIn(false)
    get.mockRejectedValue(new Error('down'))
    const mutation = host(() => useSetCommunityEmails())

    await expect(mutation.mutateAsync(true)).resolves.toBeUndefined()
    expect(useSessionStore().currentUser?.communityEmails).toBe(false)
  })
})

describe('useUnsubscribeCommunityEmails', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    post.mockReset().mockResolvedValue({ data: { unsubscribed: true } })
    get.mockReset()
  })

  it('sends the token of the link, without a session and without renewing one', async () => {
    const mutation = host(() => useUnsubscribeCommunityEmails())

    await expect(mutation.mutateAsync('tok-1')).resolves.toEqual({ unsubscribed: true })

    expect(post).toHaveBeenCalledWith('/mail/unsubscribe', undefined, {
      params: { token: 'tok-1' },
      silent: true,
      skipAuthRetry: true,
    })
    expect(get).not.toHaveBeenCalled()
  })

  it('reads the session again when someone is signed in', async () => {
    signIn(true)
    get.mockResolvedValue({ data: { ...ME, communityEmails: false } })
    const mutation = host(() => useUnsubscribeCommunityEmails())

    await mutation.mutateAsync('tok-1')
    await vi.waitFor(() => expect(useSessionStore().currentUser?.communityEmails).toBe(false))
  })
})
