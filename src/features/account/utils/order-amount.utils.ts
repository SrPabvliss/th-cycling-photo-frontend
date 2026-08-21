import { formatCurrency } from '@/features/pricing/utils/format-currency'
import type { MyOrderState } from '../types/responses/my-order.response'

export interface IOrderAmountSource {
  state: MyOrderState
  subtotal: string | null
  currency: string | null
}

export function getOrderAmountLabel(order: IOrderAmountSource): string | null {
  if (order.state === 'gifted') return 'Regalo'
  if (order.subtotal == null || order.currency == null) return null
  return formatCurrency(Number(order.subtotal), order.currency)
}
