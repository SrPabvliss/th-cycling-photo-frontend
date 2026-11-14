import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IChangeEmailRequest } from '../../types/requests/change-email.request'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'

export function useChangeEmail(options: { silent?: boolean } = {}) {
  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (payload: IChangeEmailRequest) => {
      await httpClient.post(API_ROUTES.AUTH.EMAIL_CHANGE, payload, { silent: options.silent })
    },
  })
}
