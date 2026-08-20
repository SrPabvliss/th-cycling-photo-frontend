import { useQuery, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import { toMyProfile } from '../../mappers/my-profile.mapper'
import type { IApiMyProfile } from '../../types/responses/my-profile.response'

export function useMyProfileQuery() {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.profile(),
    queryFn: async () => {
      const response = await httpClient.get<IApiMyProfile>(API_ROUTES.MY_PROFILE.BASE)
      const profile = toMyProfile(response.data)
      if (queryClient.getQueryData(ACCOUNT_QUERY_KEYS.phones()) === undefined) {
        queryClient.setQueryData(ACCOUNT_QUERY_KEYS.phones(), profile.phones)
      }
      return profile
    },
  })
}
