import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PAYMENT_QUERY_KEYS } from '@/features/payments/constants/query-keys'
import { toPaymentAccount } from '@/features/payments/mappers/payment-account.mapper'
import type { IApiPaymentAccount } from '@/features/payments/types/responses/payment-account.response'

export function usePaymentAccountQuery() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.paymentAccount(),
    queryFn: async () => {
      const response = await httpClient.get<IApiPaymentAccount | null>(
        API_ROUTES.PAYMENT_ACCOUNT.GET,
        { silent: true },
      )
      return response.data ? toPaymentAccount(response.data) : null
    },
  })
}
