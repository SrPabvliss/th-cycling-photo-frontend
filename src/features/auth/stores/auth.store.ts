import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { ICurrentUser } from '../types/responses/current-user.response'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const currentUser = ref<ICurrentUser | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setSession(token: string, user: ICurrentUser) {
    accessToken.value = token
    currentUser.value = user
  }

  function setAccessToken(token: string) {
    accessToken.value = token
  }

  function clearSession() {
    accessToken.value = null
    currentUser.value = null
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
