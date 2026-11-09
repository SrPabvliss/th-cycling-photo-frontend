import { computed } from 'vue'

import { useLogoutMutation } from './use-logout'
import { useSessionStore } from './stores/session.store'

export function useSession() {
  const sessionStore = useSessionStore()
  const logoutMutation = useLogoutMutation()

  return {
    currentUser: computed(() => sessionStore.currentUser),
    isAuthenticated: computed(() => sessionStore.isAuthenticated),
    permissions: computed(() => sessionStore.currentUser?.permissions ?? []),
    logout: () => logoutMutation.mutateAsync(),
    isLoggingOut: logoutMutation.isPending,
  }
}
