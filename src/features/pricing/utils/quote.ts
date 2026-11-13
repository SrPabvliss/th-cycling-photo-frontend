import type { IPriceTier } from '@/shared/pricing/tier-cards'

/** What an order of `quantity` photos of one event costs, worked out from the volume tiers. */
export interface IPriceQuote {
  quantity: number
  /** Price of each photo: at a tier, every photo of the order costs the same. */
  unitPrice: number
  total: number
  /** Position of the tier in use, with the tiers in order of quantity. */
  tierIndex: number
  /** The next cheaper tier and how many photos are missing to reach it; null at the best price. */
  next: { missing: number; unitPrice: number } | null
}

const toCents = (amount: number) => Math.round(amount * 100)

/** The tiers in order of quantity. Every reader of a tier index sorts them the same way. */
export function sortTiers<T extends IPriceTier>(tiers: T[]): T[] {
  return [...tiers].sort((a, b) => a.minQty - b.minQty)
}

/**
 * Prices an order on the client, for showing it while the cart is being put together. The server
 * still decides what is charged, at checkout. Null when there is nothing to show a price for: no
 * tiers, no photos, or a quantity no tier covers.
 */
export function quotePhotos(tiers: IPriceTier[], quantity: number): IPriceQuote | null {
  if (!Number.isInteger(quantity) || quantity < 1) return null

  const sorted = sortTiers(tiers)
  const tierIndex = sorted.findIndex(
    (tier) => quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty),
  )
  if (tierIndex === -1) return null

  const tier = sorted[tierIndex]!
  // Whole cents: 3 photos at 0.10 are 0.30, not 0.30000000000000004.
  const unitCents = toCents(tier.pricePerPhoto)
  const cheaper = sorted
    .slice(tierIndex + 1)
    .find((candidate) => toCents(candidate.pricePerPhoto) < unitCents)

  return {
    quantity,
    unitPrice: unitCents / 100,
    total: (unitCents * quantity) / 100,
    tierIndex,
    next: cheaper
      ? { missing: cheaper.minQty - quantity, unitPrice: toCents(cheaper.pricePerPhoto) / 100 }
      : null,
  }
}
