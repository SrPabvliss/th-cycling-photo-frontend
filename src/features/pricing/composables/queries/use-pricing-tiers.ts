import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PRICING_QUERY_KEYS } from '../../constants/query-keys'
import { toPricingTiers } from '../../mappers/pricing-tiers.mapper'
import type { IApiPricingTiers } from '../../types/responses/pricing-tiers.response'

export function usePricingTiersQuery() {
  return useQuery({
    queryKey: PRICING_QUERY_KEYS.tiers(),
    queryFn: async () => {
      const response = await httpClient.get<IApiPricingTiers>(API_ROUTES.PRICING.TIERS)
      return toPricingTiers(response.data)
    },
    staleTime: 5 * 60_000,
  })
}
