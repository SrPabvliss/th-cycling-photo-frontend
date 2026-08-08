import { formatCurrency } from '@/features/pricing/utils/format-currency'

export type ConversionDirection = 'sale' | 'gift'

export function buildConversionMessage(
  direction: ConversionDirection,
  subtotal: number | null,
  currency: string | null,
): string {
  if (subtotal === null) {
    return 'Esta orden no tiene precio registrado, así que el total de ingresos no va a cambiar.'
  }

  const amount = formatCurrency(subtotal, currency)

  return direction === 'sale'
    ? `Esta orden pasará a contar ${amount} en los ingresos.`
    : `Esta orden dejará de contar ${amount} en los ingresos.`
}
