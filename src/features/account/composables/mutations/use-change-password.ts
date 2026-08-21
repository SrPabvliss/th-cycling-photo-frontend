import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IChangePasswordRequest } from '../../types/requests/change-password.request'

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: IChangePasswordRequest) => {
      await httpClient.post(API_ROUTES.AUTH.CHANGE_PASSWORD, payload)
    },
  })
}
