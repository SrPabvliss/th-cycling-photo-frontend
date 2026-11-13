import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'

export function useSendEmailVerification(options: { silent?: boolean } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await httpClient.post(API_ROUTES.AUTH.EMAIL_VERIFICATION.BASE, undefined, {
        silent: options.silent,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.emailVerification() })
    },
  })
}
