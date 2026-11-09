import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CONTRACT_QUERY_KEYS } from '../../constants/query-keys'

function invalidateContractConsumers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEYS.all() })
  queryClient.invalidateQueries({ queryKey: [API_ROUTES.ORGANIZERS.BASE] })
}

export function useRevokeContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.post(API_ROUTES.CONTRACTS.REVOKE(id))
    },
    onSuccess: () => {
      invalidateContractConsumers(queryClient)
    },
  })
}
