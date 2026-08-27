import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { IApiCurrentUser } from '@/core/auth/current-user'

export function useSnoozePrompt() {
  const authStore = useSessionStore()

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
