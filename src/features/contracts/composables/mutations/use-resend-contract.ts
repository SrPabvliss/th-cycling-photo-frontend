import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CONTRACT_QUERY_KEYS } from '../../constants/query-keys'
import type { IApiContractIssued } from '../../types/responses/contract-issued.response'

function invalidateContractConsumers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEYS.all() })
  queryClient.invalidateQueries({ queryKey: [API_ROUTES.ORGANIZERS.BASE] })
}

export function useResendContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await httpClient.post<IApiContractIssued>(API_ROUTES.CONTRACTS.RESEND(id))
      return response.data
    },
    onSuccess: () => {
      invalidateContractConsumers(queryClient)
    },
  })
}
