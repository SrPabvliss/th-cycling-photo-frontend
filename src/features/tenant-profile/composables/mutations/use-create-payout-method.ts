import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { TENANT_PROFILE_QUERY_KEYS } from '../../constants/query-keys'
import type { CreatePayoutMethodRequest } from '../../types/requests/payout-method.request'

export function useCreatePayoutMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreatePayoutMethodRequest) => {
      const response = await httpClient.post<{ id: string }>(
        API_ROUTES.TENANT_PROFILE.PAYOUT_METHODS,
        payload,
        { silent: true },
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_PROFILE_QUERY_KEYS.payoutMethods() })
    },
  })
}
