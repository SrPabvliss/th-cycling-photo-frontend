import { computed } from 'vue'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { useLoginMutation } from './mutations/use-login'
import { useLogoutMutation } from '@/core/auth/use-logout'
import { useRegisterMutation } from './mutations/use-register'
import type { ILoginRequest } from '../types/requests/login.request'
import type { IRegisterRequest } from '../types/requests/register.request'

export function useAuth() {
  const authStore = useSessionStore()
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()
  const registerMutation = useRegisterMutation()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUser = computed(() => authStore.currentUser)

  async function login(credentials: ILoginRequest) {
    return loginMutation.mutateAsync(credentials)
  }

  async function register(data: IRegisterRequest) {
    return registerMutation.mutateAsync(data)
  }

  async function logout() {
    return logoutMutation.mutateAsync()
  }

  return {
    login,
    register,
    logout,
    isAuthenticated,
    currentUser,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
