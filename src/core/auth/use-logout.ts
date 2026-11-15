import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { useSessionStore } from './stores/session.store'

export interface ILogoutOptions {
  /**
   * Where to go once the session is gone. The panel goes to the login page. The client area
   * passes null and decides by itself: most of its screens work without a session.
   */
  redirectTo?: string | null
}

export function useLogoutMutation(options: ILogoutOptions = {}) {
  const redirectTo = options.redirectTo === undefined ? ROUTE_PATHS.LOGIN : options.redirectTo

  const sessionStore = useSessionStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      await httpClient.post(API_ROUTES.AUTH.LOGOUT, undefined, { silent: true })
    },
    onSettled: () => {
      sessionStore.clearSession()
      queryClient.clear()
      if (redirectTo !== null) router.push(redirectTo)
    },
  })
}
