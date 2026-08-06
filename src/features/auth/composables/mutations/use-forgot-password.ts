import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      await httpClient.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email }, { silent: true })
    },
  })
}
