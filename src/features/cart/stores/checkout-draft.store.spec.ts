import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useCheckoutDraftStore } from './checkout-draft.store'

function signIn(id = 'u1') {
  useSessionStore().setSession(
    'token',
    toCurrentUser({ id, email: 'a@b.c', firstName: 'Ana', lastName: null, role: 'customer' }),
  )
}

describe('useCheckoutDraftStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    signIn()
  })

  it('keeps the billing choice per event, in memory only', () => {
    const drafts = useCheckoutDraftStore()
    drafts.keep('e1', { billingAccountId: 'b1', consentChecked: true })

    expect(drafts.draftFor('e1')).toEqual({ billingAccountId: 'b1', consentChecked: true })
    expect(drafts.draftFor('e2')).toBeNull()
    expect(JSON.stringify(localStorage)).not.toContain('b1')
    expect(JSON.stringify(sessionStorage)).not.toContain('b1')
  })

  it('forgets the draft of one event', () => {
    const drafts = useCheckoutDraftStore()
    drafts.keep('e1', { billingAccountId: 'b1', consentChecked: false })
    drafts.keep('e2', { billingAccountId: 'b2', consentChecked: false })

    drafts.forget('e1')

    expect(drafts.draftFor('e1')).toBeNull()
    expect(drafts.draftFor('e2')).not.toBeNull()
  })

  it('forgets every draft when the session ends', async () => {
    const drafts = useCheckoutDraftStore()
    drafts.keep('e1', { billingAccountId: 'b1', consentChecked: true })

    useSessionStore().clearSession()
    await nextTick()

    expect(drafts.draftFor('e1')).toBeNull()
  })

  it('forgets every draft when another account signs in', async () => {
    const drafts = useCheckoutDraftStore()
    drafts.keep('e1', { billingAccountId: 'b1', consentChecked: true })

    signIn('u2')
    await nextTick()

    expect(drafts.draftFor('e1')).toBeNull()
  })

  it('keeps the drafts when only the token is refreshed', async () => {
    const drafts = useCheckoutDraftStore()
    drafts.keep('e1', { billingAccountId: 'b1', consentChecked: true })

    useSessionStore().setAccessToken('fresh')
    await nextTick()

    expect(drafts.draftFor('e1')).not.toBeNull()
  })
})
