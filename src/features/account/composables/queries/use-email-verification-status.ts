import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import type { IApiEmailVerificationStatus } from '../../types/responses/email-verification-status.response'

export function useEmailVerificationStatusQuery() {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.emailVerification(),
    queryFn: async () => {
      const response = await httpClient.get<IApiEmailVerificationStatus>(
        API_ROUTES.AUTH.EMAIL_VERIFICATION.BASE,
        // Silent: the verify screen says on the page when it fails.
        { silent: true },
      )
      return response.data
    },
  })
}
