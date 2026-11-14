import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { ConsentType } from '../../constants/consent.constants'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'

export function useRecordConsentsMutation(options: { silent?: boolean } = {}) {
  const authStore = useSessionStore()

  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (types: ConsentType[]) => {
      await httpClient.post(API_ROUTES.AUTH.CONSENTS, { types }, { silent: options.silent })
      authStore.clearPendingConsents()
    },
  })
}
