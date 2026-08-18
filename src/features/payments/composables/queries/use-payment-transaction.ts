import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PAYMENT_QUERY_KEYS } from '@/features/payments/constants/query-keys'
import type { IPaymentTransaction } from '@/features/payments/types/responses/payment-intent.response'

export function usePaymentTransactionQuery(clientTransactionId: Ref<string | null>) {
  return useQuery({
    queryKey: computed(() => PAYMENT_QUERY_KEYS.transaction(clientTransactionId.value ?? '')),
    queryFn: async () => {
      const response = await httpClient.get<IPaymentTransaction>(
        API_ROUTES.PAYMENTS.TRANSACTION(clientTransactionId.value as string),
        { silent: true },
      )
      return response.data
    },
    enabled: computed(() => !!clientTransactionId.value),
  })
}
