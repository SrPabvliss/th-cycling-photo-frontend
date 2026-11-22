import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CONSENT_TYPE } from '@/features/auth/constants/consent.constants'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'
import { refreshSessionUser } from '../../utils/refresh-session-user'

/** Turns the community emails on (records the consent) or off (revokes it), then reads `me`. */
export function useSetCommunityEmails(options: { silent?: boolean } = {}) {
  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (enabled: boolean) => {
      const url = enabled ? API_ROUTES.AUTH.CONSENTS : API_ROUTES.AUTH.CONSENTS_REVOKE
      await httpClient.post(
        url,
        { types: [CONSENT_TYPE.COMMUNITY_EMAILS] },
        { silent: options.silent },
      )
    },
    onSuccess: () => refreshSessionUser(),
  })
}
