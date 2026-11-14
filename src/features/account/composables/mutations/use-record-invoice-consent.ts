import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CONSENT_TYPE } from '@/features/auth/constants/consent.constants'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'

export function useRecordInvoiceConsent() {
  const queryClient = useQueryClient()

  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async () => {
      await httpClient.post(
        API_ROUTES.AUTH.CONSENTS,
        { types: [CONSENT_TYPE.ELECTRONIC_INVOICE] },
        { silent: true },
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.billingAccounts() })
    },
  })
}
