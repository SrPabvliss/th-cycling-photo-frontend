import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import { toUserPhones } from '../../mappers/user-phone.mapper'
import type { IApiUserPhone } from '../../types/responses/user-phone.response'

export function useMyPhonesQuery() {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.phones(),
    queryFn: async () => {
      const response = await httpClient.get<IApiUserPhone[]>(API_ROUTES.USER_PHONES.BASE)
      return toUserPhones(response.data)
    },
  })
}
