import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { TENANT_PROFILE_QUERY_KEYS } from '../../constants/query-keys'
import type { IDeletePayoutMethodRequest } from '../../types/requests/payout-method.request'

export function useDeletePayoutMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, password }: IDeletePayoutMethodRequest) => {
      await httpClient.delete(API_ROUTES.TENANT_PROFILE.PAYOUT_METHOD(id), {
        data: { password },
        silent: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_PROFILE_QUERY_KEYS.payoutMethods() })
    },
  })
}
