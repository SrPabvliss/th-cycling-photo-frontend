import type { Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'

export function useResendOrderTaxDocument(orderId: Ref<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (docId: string) => {
      await httpClient.post(API_ROUTES.ORDERS.TAX_DOCUMENT_RESENDS(orderId.value, docId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all() })
    },
  })
}
