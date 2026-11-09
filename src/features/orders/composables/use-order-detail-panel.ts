import { computed, type Ref } from 'vue'

import { openWhatsApp } from '@/shared/utils/whatsapp.utils'
import { useOrderDetailQuery } from './queries/use-order-detail'
import { useOrderActions } from './use-order-actions'
import type { OrderActionId } from '../utils/order-actions'

export function useOrderDetailPanel(orderId: Ref<string>) {
  const { data: order, isPending, isError, refetch } = useOrderDetailQuery(orderId)
  const {
    handleConfirmPayment,
    handleMarkGift,
    handleConvertToSale,
    handleConvertToGift,
    handleSendDelivery,
    handleCancel,
    handleRegenerate,
    handleNotifyPaymentInfo,
    isRegenerating,
  } = useOrderActions()

  const invoiceState = computed(() => order.value?.invoice?.state ?? null)

  function onSendPaymentInfo() {
    const o = order.value
    if (!o) return
    handleNotifyPaymentInfo(o)
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
        handleConvertToSale({
          id: o.id,
          subtotal: o.subtotal,
          snapCurrency: o.snapCurrency,
          invoiceState: invoiceState.value,
        }),
      to_gift: () =>
        handleConvertToGift({
          id: o.id,
          subtotal: o.subtotal,
          snapCurrency: o.snapCurrency,
          invoiceState: invoiceState.value,
        }),
      cancel: () => handleCancel(o.id, o.userName, invoiceState.value),
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
