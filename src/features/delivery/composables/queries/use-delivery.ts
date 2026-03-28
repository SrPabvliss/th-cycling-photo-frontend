import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { DELIVERY_QUERY_KEYS } from '../../constants/query-keys'
import { toDeliveryData } from '../../mappers/delivery-data.mapper'
import type { IApiDeliveryData } from '../../types/responses/delivery-data.response'

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
