import type { Ref } from 'vue'
import { useMessage } from 'naive-ui'

import { env } from '@/core/config/env'
import {
  buildDeliveryTemplate,
  buildPaymentInfoTemplate,
  openWhatsApp,
} from '@/shared/utils/whatsapp.utils'
import { useOrderDetailQuery } from './queries/use-order-detail'
import { useNotifyPaymentInfo } from './mutations/use-notify-payment-info'
import { useOrderActions } from './use-order-actions'
import type { OrderActionId } from '../utils/order-actions'

export function useOrderDetailPanel(orderId: Ref<string>) {
  const message = useMessage()

  const { data: order, isPending, isError, refetch } = useOrderDetailQuery(orderId)
  const { mutateAsync: notifyPaymentInfo } = useNotifyPaymentInfo()
  const {
    handleConfirmPayment,
    handleMarkGift,
    handleConvertToSale,
    handleConvertToGift,
    handleSendDelivery,
    handleCancel,
    handleRegenerate,
    isRegenerating,
  } = useOrderActions()

  async function onSendPaymentInfo() {
    const o = order.value
    if (!o) return
    try {
      await notifyPaymentInfo(o.id)
    } catch {
      message.error('No se pudo registrar el envío. Intenta de nuevo.')
      return
    }
    const template = buildPaymentInfoTemplate({
      customerFirstName: o.snapFirstName ?? o.userName,
      photoCount: o.photos.length,
      eventName: o.eventName,
      totalPrice: o.subtotal,
      currency: o.snapCurrency,
    })
    openWhatsApp(o.snapWhatsapp, template)
  }

  function onSendDeliveryWhatsApp() {
    const o = order.value
    if (!o?.deliveryLink) return
    const deliveryUrl = `${env.VITE_APP_BASE_URL}/delivery/${o.deliveryLink.token}`
    const template = buildDeliveryTemplate({
      customerFirstName: o.snapFirstName ?? o.userName,
      photoCount: o.photos.length,
      deliveryUrl,
    })
    openWhatsApp(o.snapWhatsapp, template)
  }

  function onRegenerateDelivery() {
    const o = order.value
    if (!o) return
    handleRegenerate(o.id, o.snapWhatsapp ?? undefined)
  }

  function onAction(id: OrderActionId) {
    const o = order.value
    if (!o) return

    const actions: Record<OrderActionId, () => void> = {
      notify: onSendPaymentInfo,
      resend: onSendPaymentInfo,
      confirm: () => handleConfirmPayment(o.id),
      deliver: () => handleSendDelivery(o.id, o.snapWhatsapp ?? undefined),
      regenerate: onRegenerateDelivery,
      gift: () => handleMarkGift(o.id),
      to_sale: () =>
        handleConvertToSale({ id: o.id, subtotal: o.subtotal, snapCurrency: o.snapCurrency }),
      to_gift: () =>
        handleConvertToGift({ id: o.id, subtotal: o.subtotal, snapCurrency: o.snapCurrency }),
      cancel: () => handleCancel(o.id, o.userName),
    }

    actions[id]?.()
  }

  return {
    order,
    isPending,
    isError,
    refetch,
    isRegenerating,
    onAction,
    onRegenerateDelivery,
    onSendDeliveryWhatsApp,
  }
}
