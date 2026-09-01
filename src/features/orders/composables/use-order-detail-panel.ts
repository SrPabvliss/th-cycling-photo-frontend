import type { Ref } from 'vue'
import { useMessage } from 'naive-ui'

import { openWhatsApp } from '@/shared/utils/whatsapp.utils'
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
      const result = await notifyPaymentInfo(o.id)
      // The message is composed server-side: it carries the bank account frozen on this event, and
      // the browser has no business deciding where a buyer transfers money to.
      openWhatsApp(o.snapWhatsapp, result.whatsappTemplate)
    } catch {
      message.error('No se pudo registrar el envío. Intenta de nuevo.')
    }
  }

  function onSendDeliveryWhatsApp() {
    const o = order.value
    if (!o?.deliveryLink) return
    // Same text the backend sends on delivery and regeneration; the browser used to write its own.
    openWhatsApp(o.snapWhatsapp, o.deliveryLink.whatsappTemplate)
  }

  function onRegenerateDelivery() {
    const o = order.value
    if (!o) return
    handleRegenerate(o)
  }

  function onAction(id: OrderActionId) {
    const o = order.value
    if (!o) return

    const actions: Record<OrderActionId, () => void> = {
      notify: onSendPaymentInfo,
      resend: onSendPaymentInfo,
      confirm: () => handleConfirmPayment(o.id),
      deliver: () => handleSendDelivery(o),
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
