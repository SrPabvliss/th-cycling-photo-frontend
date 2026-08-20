import type { MyOrderState } from '../types/responses/my-order.response'

export interface IOrderStateChip {
  label: string
  tone: 'warning' | 'error'
}

export function describeOrderState(state: MyOrderState): IOrderStateChip | null {
  if (state === 'in_process') return { label: 'En proceso', tone: 'warning' }
  if (state === 'cancelled') return { label: 'Cancelada', tone: 'error' }
  return null
}
