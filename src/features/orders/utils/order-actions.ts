import { PERMISSIONS, type PermissionKey } from '@/core/auth/permissions'
import { ORDER_STATUS, type OrderStatus } from '../types/responses/order-list.response'

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
  to_sale: 'Cambiar a venta',
  to_gift: 'Cambiar a regalo',
  cancel: 'Cancelar pedido',
}

const ACTION_PERMISSIONS: Record<OrderActionId, PermissionKey> = {
  notify: PERMISSIONS.ORDER_NOTIFY_PAYMENT,
  resend: PERMISSIONS.ORDER_NOTIFY_PAYMENT,
  confirm: PERMISSIONS.ORDER_CONFIRM_PAYMENT,
  deliver: PERMISSIONS.ORDER_DELIVER,
  regenerate: PERMISSIONS.ORDER_DELIVERY_REGENERATE,
  gift: PERMISSIONS.ORDER_GIFT,
  to_sale: PERMISSIONS.ORDER_CONVERT_TO_SALE,
  to_gift: PERMISSIONS.ORDER_CONVERT_TO_GIFT,
  cancel: PERMISSIONS.ORDER_CANCEL,
}

export type CanPerform = (permission: PermissionKey) => boolean

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

function baseActionIds(o: IOrderActionFacts): OrderActionId[] {
  const isCancellable =
    o.deliveredAt === null &&
    (o.status === ORDER_STATUS.PENDING ||
      o.status === ORDER_STATUS.PAYMENT_INFO_SENT ||
      o.status === ORDER_STATUS.PAID ||
      o.status === ORDER_STATUS.GIFTED)

  const cancelId: OrderActionId[] = isCancellable ? ['cancel'] : []

  switch (o.status) {
    case ORDER_STATUS.PENDING:
      return ['notify', 'confirm', ...cancelId, 'gift']
    case ORDER_STATUS.PAYMENT_INFO_SENT:
      return ['resend', 'confirm', ...cancelId, 'gift']
    case ORDER_STATUS.PAID:
      return ['deliver', ...cancelId, 'to_gift']
    case ORDER_STATUS.DELIVERED:
      return ['regenerate', 'to_gift']
    case ORDER_STATUS.GIFTED: {
      const mainAction: OrderActionId = o.deliveredAt === null ? 'deliver' : 'regenerate'
      return [mainAction, ...cancelId, 'to_sale']
    }
    default:
      return []
  }
}

export function resolveOrderActions(o: IOrderActionFacts, can: CanPerform): IOrderAction[] {
  const primary = primaryActionId(o)

  return baseActionIds(o)
    .filter((id) => can(ACTION_PERMISSIONS[id]))
    .map((id) => ({
      id,
      kind: id === 'cancel' ? 'danger' : id === primary ? 'solid' : 'ghost',
      label: ACTION_LABELS[id],
    }))
}

export function primaryOrderAction(o: IOrderActionFacts, can: CanPerform): IOrderAction | null {
  const primary = primaryActionId(o)
  if (primary === null) return null

  return resolveOrderActions(o, can).find((a) => a.id === primary) ?? null
}

export function canPerformAction(id: OrderActionId, can: CanPerform): boolean {
  return can(ACTION_PERMISSIONS[id])
}
