import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IPriceTier } from './tier-cards'

/** GET /pricing/tiers: the volume tiers and the currency they are in. */
export interface IPricingTiers {
  currency: string
  source: 'event' | 'default'
  tiers: IPriceTier[]
}

export const PRICING_TIERS_QUERY_KEY = [API_ROUTES.PRICING.BASE, 'tiers'] as const

const FIVE_MINUTES = 5 * 60_000

/**
 * The volume price tiers. Lives in shared because the cart, which is shared too, prices with them.
 * Silent: the tiers only decorate what is already on screen; where they are missing the screen
 * adapts instead of raising a toast.
 */
export function usePricingTiersQuery() {
  return useQuery({
    queryKey: PRICING_TIERS_QUERY_KEY,
    queryFn: async (): Promise<IPricingTiers> => {
      const response = await httpClient.get<IPricingTiers>(API_ROUTES.PRICING.TIERS, {
        silent: true,
      })
      return { ...response.data, tiers: response.data.tiers.map((tier) => ({ ...tier })) }
    },
    staleTime: FIVE_MINUTES,
  })
}
