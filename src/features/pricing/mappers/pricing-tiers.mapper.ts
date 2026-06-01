import type { IApiPricingTiers, IPricingTiers } from '../types/responses/pricing-tiers.response'

export function toPricingTiers(api: IApiPricingTiers): IPricingTiers {
  return { ...api, tiers: api.tiers.map((t) => ({ ...t })) }
}
