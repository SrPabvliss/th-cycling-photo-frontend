import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { ConsentType } from '../../constants/consent.constants'
import { useAuthStore } from '../../stores/auth.store'

export function useRecordConsentsMutation() {
  const authStore = useAuthStore()

  return useMutation({
    mutationFn: async (types: ConsentType[]) => {
      await httpClient.post(API_ROUTES.AUTH.CONSENTS, { types })
      authStore.clearPendingConsents()
    },
  })
}
