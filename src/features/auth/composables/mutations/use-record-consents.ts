import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { httpClient } from '@/core/http/axios-client'
import type { ConsentType } from '../../constants/consent.constants'

export function useRecordConsentsMutation() {
  const sessionStore = useSessionStore()

  return useMutation({
    mutationFn: async (types: ConsentType[]) => {
      await httpClient.post(API_ROUTES.AUTH.CONSENTS, { types })
      sessionStore.clearPendingConsents()
    },
  })
}
