import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'

export function useValidateResetTokenMutation() {
  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (token: string) => {
      const response = await httpClient.post<{ valid: boolean }>(
        API_ROUTES.AUTH.VALIDATE_RESET_TOKEN,
        { token },
        { silent: true },
      )
      return response.data.valid
    },
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (payload: { token: string; password: string }) => {
      // The screen says what went wrong.
      await httpClient.post(API_ROUTES.AUTH.RESET_PASSWORD, payload, { silent: true })
    },
  })
}
