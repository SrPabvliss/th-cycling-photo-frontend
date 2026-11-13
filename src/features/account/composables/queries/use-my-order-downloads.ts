import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import { toMyOrderDownloads } from '../../mappers/my-order.mapper'
import type { IApiMyOrderDownloads } from '../../types/responses/my-order.response'

/**
 * The photos of a released order, with their download and thumbnail addresses (both last an
 * hour). Only asked for while `enabled`: an order not paid yet answers 422.
 */
export function useMyOrderDownloadsQuery(orderId: Ref<string>, enabled: Ref<boolean>) {
  return useQuery({
    queryKey: computed(() => ACCOUNT_QUERY_KEYS.orderDownloads(orderId.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiMyOrderDownloads>(
        API_ROUTES.MY_ORDERS.DOWNLOADS(orderId.value),
        { silent: true },
      )
      return toMyOrderDownloads(response.data).photos
    },
    enabled: computed(() => enabled.value && orderId.value.length > 0),
  })
}
