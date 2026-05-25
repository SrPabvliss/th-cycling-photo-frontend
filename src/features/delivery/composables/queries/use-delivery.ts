import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { DELIVERY_QUERY_KEYS } from '../../constants/query-keys'
import { toDeliveryData } from '../../mappers/delivery-data.mapper'
import type { IApiDeliveryData } from '../../types/responses/delivery-data.response'

// Backend signs B2 download URLs with a 1-hour TTL. The backend also caps
// total accesses per delivery token at 50 (server-side anti-sharing). We
// therefore refresh on-demand instead of on a timer:
//   - staleTime = 45min: query is fresh well within the 1h URL lifetime
//   - refetchOnWindowFocus + refetchOnMount: customer returning to the
//     tab after >45min triggers a refetch and gets fresh URLs before
//     clicking download
// This keeps the per-token access count tied to actual visits rather
// than a polling interval, leaving plenty of headroom under the 50-cap.
const STALE_MS = 45 * 60 * 1000

export function useDeliveryQuery(token: Ref<string>) {
  const query = useQuery({
    queryKey: computed(() => DELIVERY_QUERY_KEYS.delivery(token.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiDeliveryData>(
        API_ROUTES.DELIVERY_PUBLIC.GET_BY_TOKEN(token.value),
        { silent: true },
      )
      return toDeliveryData(response.data)
    },
    enabled: computed(() => !!token.value),
    retry: false,
    staleTime: STALE_MS,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  const isExpired = computed(() => {
    if (!query.error.value) return false
    const err = query.error.value as { response?: { status?: number } }
    return err.response?.status === 410
  })

  const isNotFound = computed(() => {
    if (!query.error.value) return false
    const err = query.error.value as { response?: { status?: number } }
    return err.response?.status === 404
  })

  return {
    ...query,
    isExpired,
    isNotFound,
  }
}
