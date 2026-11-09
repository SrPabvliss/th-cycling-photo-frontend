const SYMBOLS: Record<string, string> = { USD: '$' }

export function formatCurrency(value: number, currency: string | null | undefined): string {
  const code = currency ?? 'USD'
  const symbol = SYMBOLS[code] ?? `${code} `
  return `${symbol}${value.toFixed(2)}`
}
