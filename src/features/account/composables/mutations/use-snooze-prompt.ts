import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/features/auth/mappers/current-user.mapper'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { IApiCurrentUser } from '@/features/auth/types/responses/current-user.response'

export function useSnoozePrompt() {
  const authStore = useAuthStore()

  return useMutation({
    mutationFn: async (key: string) => {
      await httpClient.post(API_ROUTES.AUTH.PROMPTS.SNOOZE(key))
    },
    onSuccess: async () => {
      if (!authStore.accessToken) return
      const meResponse = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, {
        silent: true,
      })
      authStore.setSession(authStore.accessToken, toCurrentUser(meResponse.data))
    },
  })
}
