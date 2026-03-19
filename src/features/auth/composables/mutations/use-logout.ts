import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { useAuthStore } from '../../stores/auth.store'

export function useLogoutMutation() {
  const authStore = useAuthStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      await httpClient.post(API_ROUTES.AUTH.LOGOUT, undefined, { silent: true })
    },
    onSettled: () => {
      authStore.clearSession()
      queryClient.clear()
      router.push('/login')
    },
  })
}
