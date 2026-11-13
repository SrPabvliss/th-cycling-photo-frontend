const LOCALE = 'es-EC'

/** A volume price tier, as GET /pricing/tiers sends it. `maxQty` null means "and up". */
export interface IPriceTier {
  minQty: number
  maxQty: number | null
  pricePerPhoto: number
}

/** A tier ready to show: every text already written, nothing left to compute in the template. */
export interface ITierCard {
  /** "1 a 2 fotos", "10 o más fotos", "3 fotos". */
  label: string
  price: string
  /** Whole percent off the base price; null when there is nothing off. */
  discountPercent: number | null
  /** The base price to cross out next to a discounted one; null when there is no discount. */
  basePrice: string | null
  isBest: boolean
}

/** Money as written in Ecuador: "$4,00". */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(amount)
  } catch {
    // Not an ISO currency code: the number is still worth showing.
    const number = new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
    return `${currency} ${number}`
  }
}

const byQuantity = (a: IPriceTier, b: IPriceTier) => a.minQty - b.minQty
const photos = (quantity: number) => (quantity === 1 ? 'foto' : 'fotos')

function tierLabel(tier: IPriceTier): string {
  if (tier.maxQty === null) return `${tier.minQty} o más fotos`
  if (tier.maxQty === tier.minQty) return `${tier.minQty} ${photos(tier.minQty)}`
  return `${tier.minQty} a ${tier.maxQty} fotos`
}

/** Index of the cheapest tier of a list sorted by quantity; the last one when several tie. */
function bestIndex(sorted: IPriceTier[]): number {
  let best = -1
  sorted.forEach((tier, index) => {
    if (best === -1 || tier.pricePerPhoto <= sorted[best]!.pricePerPhoto) best = index
  })
  return best
}

/**
 * Cards for the volume price tiers, in order of quantity. The base price is the one of the first
 * tier, and every discount is measured against it. The tiers come from the api: nothing here
 * assumes how many there are or what they cost.
 */
export function buildTierCards(tiers: IPriceTier[], currency: string): ITierCard[] {
  const sorted = [...tiers].sort(byQuantity)
  if (sorted.length === 0) return []

  const base = sorted[0]!.pricePerPhoto
  const best = bestIndex(sorted)

  return sorted.map((tier, index) => {
    const percent = base > 0 ? Math.round((1 - tier.pricePerPhoto / base) * 100) : 0
    const hasDiscount = percent > 0

    return {
      label: tierLabel(tier),
      price: formatMoney(tier.pricePerPhoto, currency),
      discountPercent: hasDiscount ? percent : null,
      basePrice: hasDiscount ? formatMoney(base, currency) : null,
      isBest: index === best,
    }
  })
}

/** The cheapest tier when it is the open one ("10 or more"); null otherwise. */
export function bestOpenTier(tiers: IPriceTier[]): IPriceTier | null {
  const sorted = [...tiers].sort(byQuantity)
  const best = sorted[bestIndex(sorted)]

  return best && best.maxQty === null ? best : null
}
