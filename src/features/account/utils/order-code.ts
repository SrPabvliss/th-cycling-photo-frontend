const ORDER_CODE_LENGTH = 8

/** The order code a person can read out: the first block of its id, in capitals. */
export function orderCode(orderId: string): string {
  return orderId.slice(0, ORDER_CODE_LENGTH).toUpperCase()
}
