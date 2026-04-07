import { computed } from 'vue'

import { USER_ROLES } from '@/core/auth/role-config'
import { useAuthStore } from '../stores/auth.store'
import { useLoginMutation } from './mutations/use-login'
import { useLogoutMutation } from './mutations/use-logout'
import { useRegisterMutation } from './mutations/use-register'
import type { ILoginRequest } from '../types/requests/login.request'
import type { IRegisterRequest } from '../types/requests/register.request'

export function useAuth() {
  const authStore = useAuthStore()
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()
  const registerMutation = useRegisterMutation()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUser = computed(() => authStore.currentUser)
  const isCustomer = computed(() => authStore.currentUser?.role === USER_ROLES.CUSTOMER)

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
