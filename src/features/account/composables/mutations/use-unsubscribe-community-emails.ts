import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'
import { refreshSessionUser } from '../../utils/refresh-session-user'

/** The link of a community email: the token is the only credential, no session needed. */
export function useUnsubscribeCommunityEmails() {
  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (token: string) => {
      // The screen says what went wrong. A 401 is the answer, not a session to renew.
      const response = await httpClient.post<{ unsubscribed: boolean }>(
        API_ROUTES.MAIL.UNSUBSCRIBE,
        undefined,
        { params: { token }, silent: true, skipAuthRetry: true },
      )
      return response.data
    },
    // Whoever is signed in here may be the same person: the switch of the account follows,
    // without holding the answer back.
    onSuccess: () => {
      void refreshSessionUser()
    },
  })
}
