import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'

export function useForgotPasswordMutation() {
  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (email: string) => {
      await httpClient.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email }, { silent: true })
    },
  })
}
