import type { Component } from 'vue'
import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import {
  BanOutline,
  CheckmarkCircleOutline,
  GiftOutline,
  HourglassOutline,
} from '@vicons/ionicons5'

import { formatDateTime } from '@/shared/utils/date.utils'
import { ORDER_STATUS } from '../types/responses/order-list.response'
import type { IOrderDetail } from '../types/responses/order-detail.response'
import { PAYMENT_METHOD_LABELS } from '../constants/status-config'

export interface IOrderDetailNotice {
  tone: 'red' | 'amber' | 'blue'
  icon: Component
  title: string
  body: string | null
}

export interface IOrderIdentityDiff {
  label: string
  before: string
  after: string
}

export function getOrderAvatarInitials(userName: string): string {
  const parts = userName.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase() || '—'
}

export function buildOrderDetailNotice(
  order: IOrderDetail,
  isPlatform: boolean,
): IOrderDetailNotice | null {
  if (order.status === ORDER_STATUS.CANCELLED) {
    return {
      tone: 'red',
      icon: BanOutline,
      title: `Pedido cancelado el ${order.cancelledAt ? formatDateTime(order.cancelledAt) : '—'}`,
      body: order.notes,
    }
  }

  if (order.status === ORDER_STATUS.GIFTED && order.deliveredAt !== null) {
    const correction = isPlatform
      ? 'Si en realidad se cobró, corrígela a venta.'
      : 'Si en realidad se cobró, pídelo a Titan TV: la corrección es solo de plataforma.'
    return {
      tone: 'blue',
      icon: GiftOutline,
      title: 'Obsequio ya entregado. Este pedido está terminado.',
      body: `No entra en ingresos y ya no se puede cancelar: la entrega está hecha. ${correction}`,
    }
  }

  if (order.status === ORDER_STATUS.GIFTED) {
    return {
      tone: 'amber',
      icon: GiftOutline,
      title: 'Obsequio, pero las fotos siguen sin entregar.',
      body: 'No hay nada que cobrar; falta el paso de entrega para cerrarla.',
    }
  }

  if (order.status === ORDER_STATUS.DELIVERED) {
    return {
      tone: 'blue',
      icon: CheckmarkCircleOutline,
      title: `Entregado el ${order.deliveredAt ? formatDateTime(order.deliveredAt) : '—'}.`,
      body: 'Un pedido entregado ya no se puede cancelar. Si el comprador perdió el acceso, regenera el enlace.',
    }
  }

  if (order.status === ORDER_STATUS.PENDING) {
    return {
      tone: 'amber',
      icon: HourglassOutline,
      title: 'El comprador todavía no sabe cómo pagar.',
      body: 'Enviar la info de pago por WhatsApp es el siguiente paso. Reenviarla después no rompe nada ni duplica el pedido.',
    }
  }

  return null
}

export function getOrderIdentityDiffs(order: IOrderDetail): IOrderIdentityDiff[] {
  const diffs: IOrderIdentityDiff[] = []

  const snapName = [order.snapFirstName, order.snapLastName].filter(Boolean).join(' ').trim()
  const liveName = order.userName.trim()
  if (snapName && liveName && snapName !== liveName) {
    diffs.push({ label: 'Nombre', before: snapName, after: liveName })
  }

  if (hasOrderPhoneDrifted(order)) {
    diffs.push({
      label: 'Teléfono',
      before: order.snapWhatsapp ? formatWhatsAppNumber(order.snapWhatsapp) : 'sin número',
      after: formatWhatsAppNumber(order.customerPrimaryPhone ?? ''),
    })
  }

  return diffs
}

/**
 * The account has a phone and the order was frozen with another one, or with none. An order in
 * progress follows the account by itself; this is left for the ones placed before that, and for
 * a correction made on the order alone.
 */
export function hasOrderPhoneDrifted(
  order: Pick<IOrderDetail, 'snapWhatsapp' | 'customerPrimaryPhone'>,
): boolean {
  return !!order.customerPrimaryPhone && order.customerPrimaryPhone !== order.snapWhatsapp
}

export function getPaymentMethodLabel(paymentMethod: string | null): string {
  return paymentMethod ? (PAYMENT_METHOD_LABELS[paymentMethod] ?? 'Sin método') : 'Sin método'
}

export function shouldShowInternalNote(order: IOrderDetail): boolean {
  return !!order.notes && order.status !== ORDER_STATUS.CANCELLED
}
