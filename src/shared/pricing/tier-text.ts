import { formatMoney } from './tier-cards'
import type { IPriceQuote } from './quote'

/** What the buyer gains by adding more photos: "Con 1 foto más, todas bajan a $3,00 c/u". */
export function nextTierText(quote: IPriceQuote, currency: string): string {
  if (!quote.next) return 'Ya tienes el mejor precio'

  const { missing, unitPrice } = quote.next
  const photos = missing === 1 ? 'foto' : 'fotos'
  return `Con ${missing} ${photos} más, todas bajan a ${formatMoney(unitPrice, currency)} c/u`
}
