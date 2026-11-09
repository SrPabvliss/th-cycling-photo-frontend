import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IChangeEmailRequest } from '../../types/requests/change-email.request'

export function useChangeEmail() {
  return useMutation({
    mutationFn: async (payload: IChangeEmailRequest) => {
      await httpClient.post(API_ROUTES.AUTH.EMAIL_CHANGE, payload)
    },
  })
}
