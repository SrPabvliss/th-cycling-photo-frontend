import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import type { IAddPhoneRequest } from '../../types/requests/phone.request'

export function useAddPhone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: IAddPhoneRequest) => {
      const response = await httpClient.post<{ id: string }>(API_ROUTES.USER_PHONES.BASE, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.phones() })
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.profile() })
    },
  })
}
