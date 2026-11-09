import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { canOperate, canShop } from '../capabilities'
import type { ICurrentUser } from '../current-user'
import { useHatStore } from './hat.store'

const TOKEN_KEY = 'titan_access_token'

export const useSessionStore = defineStore('session', () => {
  const accessToken = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const currentUser = ref<ICurrentUser | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setSession(token: string, user: ICurrentUser) {
    accessToken.value = token
    currentUser.value = user
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
    localStorage.removeItem(TOKEN_KEY)
    useHatStore().reset()
  }

  return {
    accessToken,
    currentUser,
    isAuthenticated,
    setSession,
    setAccessToken,
    clearPendingConsents,
    clearSession,
  }
})
