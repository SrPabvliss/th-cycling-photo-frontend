/**
 * Payment information shown to customers when coordinating an order.
 * These values are user-facing (we send them by WhatsApp), so keeping
 * them as a frontend constant is fine — they are not secret material.
 */
export const PAYMENT_INFO = {
  bankName: 'Banco Pichincha',
  accountType: 'Cuenta de ahorro transaccional',
  accountNumber: '3740360400',
  accountHolder: 'Franklin Villacres',
} as const
