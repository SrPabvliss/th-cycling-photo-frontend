import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import type { IUserPhone } from '../../types/responses/user-phone.response'
import type { IUpdatePhoneRequest } from '../../types/requests/phone.request'

export function useUpdatePhone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      phoneId,
      payload,
    }: {
      phoneId: IUserPhone['id']
      payload: IUpdatePhoneRequest
    }) => {
      const response = await httpClient.patch<{ id: string }>(
        API_ROUTES.USER_PHONES.BY_ID(phoneId),
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.phones() })
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.profile() })
    },
  })
}
