import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { ICurrentUser } from '../types/responses/current-user.response'

const TOKEN_KEY = 'titan_access_token'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const currentUser = ref<ICurrentUser | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setSession(token: string, user: ICurrentUser) {
    accessToken.value = token
    currentUser.value = user
    localStorage.setItem(TOKEN_KEY, token)
  }

  function setAccessToken(token: string) {
    accessToken.value = token
    localStorage.setItem(TOKEN_KEY, token)
  }

  function clearSession() {
    accessToken.value = null
    currentUser.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return {
    accessToken,
    currentUser,
    isAuthenticated,
    setSession,
    setAccessToken,
    clearSession,
  }
})
