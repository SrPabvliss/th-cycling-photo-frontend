import { computed } from 'vue'

import { useAuthStore } from '../stores/auth.store'
import { useLoginMutation } from './mutations/use-login'
import { useLogoutMutation } from './mutations/use-logout'
import type { ILoginRequest } from '../types/requests/login.request'

export function useAuth() {
  const authStore = useAuthStore()
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUser = computed(() => authStore.currentUser)

  async function login(credentials: ILoginRequest) {
    return loginMutation.mutateAsync(credentials)
  }

  async function logout() {
    return logoutMutation.mutateAsync()
  }

  return {
    login,
    logout,
    isAuthenticated,
    currentUser,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
