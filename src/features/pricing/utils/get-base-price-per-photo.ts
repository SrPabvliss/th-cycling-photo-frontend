import type { IPricingTier } from '../types/responses/pricing-preview.response'

/** Highest per-photo price = base tier (smallest minQty). Null if no tiers. */
export function getBasePricePerPhoto(tiers: IPricingTier[]): number | null {
  if (!tiers.length) return null
  return tiers.reduce((base, t) => (t.minQty < base.minQty ? t : base), tiers[0]!).pricePerPhoto
}
