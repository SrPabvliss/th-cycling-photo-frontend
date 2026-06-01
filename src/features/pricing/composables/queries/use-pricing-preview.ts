import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRef, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PRICING_QUERY_KEYS } from '../../constants/query-keys'
import { toPricingPreview } from '../../mappers/pricing-preview.mapper'
import type { IApiPricingPreview } from '../../types/responses/pricing-preview.response'

export function usePricingPreviewQuery(photoCount: MaybeRef<number>) {
  const enabled = computed(() => toValue(photoCount) > 0)

  return useQuery({
    queryKey: computed(() => PRICING_QUERY_KEYS.preview(toValue(photoCount))),
    queryFn: async () => {
      const response = await httpClient.get<IApiPricingPreview>(API_ROUTES.PRICING.PREVIEW, {
        params: { photoCount: toValue(photoCount) },
      })
      return toPricingPreview(response.data)
    },
    enabled,
    staleTime: 60_000,
  })
}
