import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IContactRequestRequest } from '../../types/requests/contact-request.request'

export function useSendContactRequest() {
  return useMutation({
    mutationFn: async (payload: IContactRequestRequest) => {
      await httpClient.post(API_ROUTES.TENANT_PROFILE.CONTACT_REQUESTS, payload, {
        silent: true,
      })
    },
  })
}
