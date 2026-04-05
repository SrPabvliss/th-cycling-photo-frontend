import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPendingRetouchGroup } from '../../mappers/pending-retouch.mapper'
import type { IApiPendingRetouchGroup } from '../../types/responses/pending-retouch.response'

export const PENDING_RETOUCH_KEY = ['photos', 'pending-retouch'] as const

export function usePendingRetouchQuery() {
  return useQuery({
    queryKey: PENDING_RETOUCH_KEY,
    queryFn: async () => {
      const { data } = await httpClient.get<IApiPendingRetouchGroup[]>(
        API_ROUTES.PHOTOS.PENDING_RETOUCH,
      )
      return data.map(toPendingRetouchGroup)
    },
    refetchInterval: 30_000,
  })
}
