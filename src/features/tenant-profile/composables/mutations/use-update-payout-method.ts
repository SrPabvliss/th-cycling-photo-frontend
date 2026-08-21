import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { TENANT_PROFILE_QUERY_KEYS } from '../../constants/query-keys'
import type { UpdatePayoutMethodRequest } from '../../types/requests/payout-method.request'

export function useUpdatePayoutMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdatePayoutMethodRequest }) => {
      await httpClient.patch(API_ROUTES.TENANT_PROFILE.PAYOUT_METHOD(id), payload, {
        silent: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_PROFILE_QUERY_KEYS.payoutMethods() })
    },
  })
}
