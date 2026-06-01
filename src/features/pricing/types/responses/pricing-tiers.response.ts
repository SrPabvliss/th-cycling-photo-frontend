import type { IApiPricingTier, IPricingTier } from './pricing-preview.response'

export interface IApiPricingTiers {
  currency: string
  source: 'event' | 'default'
  tiers: IApiPricingTier[]
}

export interface IPricingTiers {
  currency: string
  source: 'event' | 'default'
  tiers: IPricingTier[]
}
