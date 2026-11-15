import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { canOperate, canShop } from '../capabilities'
import type { ICurrentUser } from '../current-user'
import { useHatStore } from './hat.store'

const TOKEN_KEY = 'titan_access_token'

export const useSessionStore = defineStore('session', () => {
  const accessToken = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const currentUser = ref<ICurrentUser | null>(null)
  /** The session ended because it could not be renewed, not because the person signed out. */
  const expired = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setSession(token: string, user: ICurrentUser) {
    accessToken.value = token
    currentUser.value = user
    expired.value = false
    localStorage.setItem(TOKEN_KEY, token)
    useHatStore().initFor(user.id, canShop(user.permissions), canOperate(user.permissions))
  }

  function setAccessToken(token: string) {
    accessToken.value = token
    localStorage.setItem(TOKEN_KEY, token)
  }

  function clearPendingConsents() {
    if (currentUser.value) currentUser.value = { ...currentUser.value, pendingConsents: [] }
  }

  function clearSession() {
    accessToken.value = null
    currentUser.value = null
    expired.value = false
    localStorage.removeItem(TOKEN_KEY)
    useHatStore().reset()
  }

  /** Ends a session that could not be renewed, remembering that it expired. */
  function expireSession() {
    clearSession()
    expired.value = true
  }

  return {
    accessToken,
    currentUser,
    isAuthenticated,
    expired,
    setSession,
    setAccessToken,
    clearPendingConsents,
    clearSession,
    expireSession,
  }
})
