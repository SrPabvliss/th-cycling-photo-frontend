import { computed, watch, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDocumentVisibility } from '@vueuse/core'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { DELIVERY_QUERY_KEYS } from '../../constants/query-keys'
import { toDeliveryData } from '../../mappers/delivery-data.mapper'
import type { IApiDeliveryData } from '../../types/responses/delivery-data.response'
import { deliveryProblem } from '../../utils/delivery-problem'

/** The download addresses last an hour; past this they are asked for again before using them. */
const FRESH_FOR_MS = 55 * 60_000

/**
 * The photos of a delivery link. Every read spends one of the link's 50 accesses, so it is read
 * once, and again only when its addresses are about to expire and the buyer comes back to the tab
 * or goes to download, or presses "Reintentar". Never on focus, on reconnecting or by itself.
 */
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
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const fetchedAt = computed(() => query.dataUpdatedAt.value)

  async function ensureFresh(): Promise<void> {
    if (!query.data.value || Date.now() - fetchedAt.value <= FRESH_FOR_MS) return
    await query.refetch()
  }

  // Back to the tab after a while: only addresses about to expire are worth an access.
  const visibility = useDocumentVisibility()
  watch(visibility, (current) => {
    if (current === 'visible') void ensureFresh()
  })

  const problem = computed(() => (query.error.value ? deliveryProblem(query.error.value) : null))

  return { ...query, fetchedAt, ensureFresh, problem }
}
