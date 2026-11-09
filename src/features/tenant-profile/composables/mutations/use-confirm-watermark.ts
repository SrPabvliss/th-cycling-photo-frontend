import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { TENANT_PROFILE_QUERY_KEYS } from '../../constants/query-keys'

export function useConfirmWatermark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (storageKey: string) => {
      await httpClient.post(API_ROUTES.TENANT_PROFILE.WATERMARK_CONFIRM, { storageKey })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_PROFILE_QUERY_KEYS.profile() })
    },
  })
}
