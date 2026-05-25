import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { DELIVERY_QUERY_KEYS } from '../../constants/query-keys'
import { toDeliveryData } from '../../mappers/delivery-data.mapper'
import type { IApiDeliveryData } from '../../types/responses/delivery-data.response'

// Backend signs B2 download URLs with a 1-hour TTL. Refetch before that to
// avoid serving expired links to a tab the user left open.
const PRESIGNED_TTL_MS = 60 * 60 * 1000
const STALE_BUFFER_MS = 15 * 60 * 1000
const REFETCH_BUFFER_MS = 10 * 60 * 1000

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
    staleTime: PRESIGNED_TTL_MS - STALE_BUFFER_MS,
    refetchInterval: PRESIGNED_TTL_MS - REFETCH_BUFFER_MS,
    refetchIntervalInBackground: true,
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
