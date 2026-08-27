import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { AUTH_PATH } from '@/features/auth/routes'
import { useSessionStore } from './stores/session.store'

export function useLogoutMutation() {
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
      router.push(AUTH_PATH)
    },
  })
}
