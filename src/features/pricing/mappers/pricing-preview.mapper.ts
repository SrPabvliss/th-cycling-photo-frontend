import type {
  IApiPricingPreview,
  IPricingPreview,
} from '../types/responses/pricing-preview.response'

export function toPricingPreview(api: IApiPricingPreview): IPricingPreview {
  return {
    ...api,
    tier: { ...api.tier },
    nextTier: api.nextTier ? { ...api.nextTier } : null,
  }
}
