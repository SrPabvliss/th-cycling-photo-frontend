import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useMessage } from 'naive-ui'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PAYMENT_QUERY_KEYS } from '@/features/payments/constants/query-keys'
import type { IConfigurePaymentAccountRequest } from '@/features/payments/types/requests/payment.request'

export function useConfigurePaymentAccount() {
  const queryClient = useQueryClient()
  const message = useMessage()

  return useMutation({
    mutationFn: (data: IConfigurePaymentAccountRequest) =>
      httpClient.put(API_ROUTES.PAYMENT_ACCOUNT.CONFIGURE, data, { silent: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.paymentAccount() })
      message.success('Cobros configurados correctamente')
    },
  })
}
