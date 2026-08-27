import { ORDER_STATUS, type OrderStatus } from '@/shared/types/order-status.types'

export type OrderOperatorRole = 'titan' | 'organizer' | 'operator'

export type OrderActionId =
  | 'notify'
  | 'resend'
  | 'confirm'
  | 'deliver'
  | 'regenerate'
  | 'gift'
  | 'to_sale'
  | 'to_gift'
  | 'cancel'

export type OrderActionKind = 'solid' | 'ghost' | 'danger'

export interface IOrderAction {
  id: OrderActionId
  kind: OrderActionKind
  label: string
}

export interface IOrderActionFacts {
  status: OrderStatus
  deliveredAt: Date | null
}

const ACTION_LABELS: Record<OrderActionId, string> = {
  notify: 'Enviar info de pago',
  resend: 'Reenviar info de pago',
  confirm: 'Confirmar pago',
  deliver: 'Entregar fotos',
  regenerate: 'Regenerar enlace',
  gift: 'Marcar como regalada',
  to_sale: 'Corregir a venta',
  to_gift: 'Corregir a regalada',
  cancel: 'Cancelar pedido',
}

const STATUS_PRIMARY_ACTION: Partial<Record<OrderStatus, OrderActionId>> = {
  [ORDER_STATUS.PENDING]: 'notify',
  [ORDER_STATUS.PAYMENT_INFO_SENT]: 'confirm',
  [ORDER_STATUS.PAID]: 'deliver',
}

export function isPlatformRole(role: OrderOperatorRole): boolean {
  return role === 'titan'
}

function primaryActionId(o: IOrderActionFacts): OrderActionId | null {
  if (o.status === ORDER_STATUS.GIFTED) {
    return o.deliveredAt === null ? 'deliver' : null
  }
  return STATUS_PRIMARY_ACTION[o.status] ?? null
}

function baseActionIds(o: IOrderActionFacts, isPlatform: boolean): OrderActionId[] {
  const isCancellable =
    o.deliveredAt === null &&
    (o.status === ORDER_STATUS.PENDING ||
      o.status === ORDER_STATUS.PAYMENT_INFO_SENT ||
      o.status === ORDER_STATUS.PAID ||
      o.status === ORDER_STATUS.GIFTED)

  const cancelId: OrderActionId[] = isCancellable ? ['cancel'] : []

  switch (o.status) {
    case ORDER_STATUS.PENDING:
      return ['notify', 'confirm', ...cancelId, ...(isPlatform ? (['gift'] as const) : [])]
    case ORDER_STATUS.PAYMENT_INFO_SENT:
      return ['resend', 'confirm', ...cancelId, ...(isPlatform ? (['gift'] as const) : [])]
    case ORDER_STATUS.PAID:
      return ['deliver', ...cancelId, ...(isPlatform ? (['to_gift'] as const) : [])]
    case ORDER_STATUS.DELIVERED:
      return ['regenerate', ...(isPlatform ? (['to_gift'] as const) : [])]
    case ORDER_STATUS.GIFTED: {
      const mainAction: OrderActionId = o.deliveredAt === null ? 'deliver' : 'regenerate'
      return [mainAction, ...cancelId, ...(isPlatform ? (['to_sale'] as const) : [])]
    }
    default:
      return []
  }
}

export function resolveOrderActions(o: IOrderActionFacts, isPlatform: boolean): IOrderAction[] {
  const primary = primaryActionId(o)

  return baseActionIds(o, isPlatform).map((id) => ({
    id,
    kind: id === 'cancel' ? 'danger' : id === primary ? 'solid' : 'ghost',
    label: ACTION_LABELS[id],
  }))
}

export function primaryOrderAction(o: IOrderActionFacts, isPlatform: boolean): IOrderAction | null {
  const primary = primaryActionId(o)
  if (primary === null) return null

  return resolveOrderActions(o, isPlatform).find((a) => a.id === primary) ?? null
}
