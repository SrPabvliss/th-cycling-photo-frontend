import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'

export function useSendEmailVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await httpClient.post(API_ROUTES.AUTH.EMAIL_VERIFICATION.BASE)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.emailVerification() })
    },
  })
}
