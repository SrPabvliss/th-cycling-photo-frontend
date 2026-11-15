// Which event a card payment belongs to, so the screens after the gateway can lead back to its
// order. Only a navigation id: the gateway's return address cannot carry it. Per tab; storage
// may be missing or blocked, and then the way back is the gallery.
const STORAGE_KEY = 'tt-card-payment-event'

interface IRemembered {
  orders: string
  eventId: string
}

const keyOf = (orderIds: readonly string[]) => [...orderIds].sort().join(',')

export function rememberCardPaymentEvent(orderIds: readonly string[], eventId: string): void {
  try {
    const value: IRemembered = { orders: keyOf(orderIds), eventId }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Without storage the way back is the gallery.
  }
}

export function cardPaymentEvent(orderIds: readonly string[]): string | null {
  if (orderIds.length === 0) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const value = raw ? (JSON.parse(raw) as Partial<IRemembered>) : null
    return value?.orders === keyOf(orderIds) && typeof value.eventId === 'string'
      ? value.eventId
      : null
  } catch {
    return null
  }
}
