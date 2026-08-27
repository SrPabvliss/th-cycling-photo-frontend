export function decimalToCents(decimal: string): number {
  const isNegative = decimal.trimStart().startsWith('-')
  const [whole, fraction = '0'] = decimal.replace('-', '').split('.')
  const centsFraction = `${fraction}00`.slice(0, 2)
  const magnitude = Number(whole) * 100 + Number(centsFraction)
  return isNegative ? -magnitude : magnitude
}

export function centsToDecimal(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const absoluteCents = Math.abs(cents)
  const whole = Math.floor(absoluteCents / 100)
  const remainder = String(absoluteCents % 100).padStart(2, '0')
  return `${sign}${whole}.${remainder}`
}

export function sumSubtotalCents(orders: { subtotalDecimal: string | null }[]): number {
  return orders.reduce(
    (total, order) => total + (order.subtotalDecimal ? decimalToCents(order.subtotalDecimal) : 0),
    0,
  )
}
