import { computed } from 'vue'

import { USER_ROLES } from '@/core/auth/role-config'
import { useLogoutMutation } from '@/core/auth/use-logout'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useLoginMutation } from './mutations/use-login'
import { useRegisterMutation } from './mutations/use-register'
import type { ILoginRequest } from '../types/requests/login.request'
import type { IRegisterRequest } from '../types/requests/register.request'

export function useAuth() {
  const sessionStore = useSessionStore()
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()
  const registerMutation = useRegisterMutation()

  const isAuthenticated = computed(() => sessionStore.isAuthenticated)
  const currentUser = computed(() => sessionStore.currentUser)
  const isCustomer = computed(() => sessionStore.currentUser?.role === USER_ROLES.CUSTOMER)

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
    isCustomer,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
