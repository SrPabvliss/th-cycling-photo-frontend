import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'

export function useCancelMyOrder(options: { silent?: boolean } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (orderId: string) => {
      await httpClient.patch(API_ROUTES.MY_ORDERS.CANCEL(orderId), undefined, {
        silent: options.silent,
      })
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.orders() })
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.order(orderId) })
    },
  })
}
