import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import type { IUserPhone } from '../../types/responses/user-phone.response'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'

export function useSetPrimaryPhone(options: { silent?: boolean } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (phoneId: IUserPhone['id']) => {
      const response = await httpClient.patch<{ id: string }>(
        API_ROUTES.USER_PHONES.SET_PRIMARY(phoneId),
        undefined,
        { silentSuccess: true, silent: options.silent },
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.phones() })
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.profile() })
    },
  })
}
