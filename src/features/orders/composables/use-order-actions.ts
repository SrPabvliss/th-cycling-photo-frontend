import { useDialog, useMessage } from 'naive-ui'

import { buildPaymentInfoTemplate, openWhatsApp } from '@/shared/utils/whatsapp.utils'
import { useConfirmPayment } from './mutations/use-confirm-payment'
import { useNotifyPaymentInfo } from './mutations/use-notify-payment-info'
import { useSendDelivery } from './mutations/use-send-delivery'
import { useCancelOrder } from './mutations/use-cancel-order'
import { useRegenerateDelivery } from './mutations/use-regenerate-delivery'
import type { IOrderListItem } from '../types/responses/order-list.response'

export function useOrderActions() {
  const dialog = useDialog()
  const message = useMessage()

  const { mutateAsync: confirmPayment } = useConfirmPayment()
  const { mutateAsync: notifyPaymentInfo } = useNotifyPaymentInfo()
  const { mutateAsync: sendDelivery } = useSendDelivery()
  const { mutateAsync: cancelOrder } = useCancelOrder()
  const { mutateAsync: regenerateDelivery, isPending: isRegenerating } = useRegenerateDelivery()

  function handleConfirmPayment(orderId: string) {
    dialog.warning({
      title: 'Confirmar pago',
      content: '¿Confirmas que el pago fue recibido?',
      positiveText: 'Confirmar pago',
      negativeText: 'Cancelar',
      onPositiveClick: async () => {
        await confirmPayment(orderId)
        message.success('Pago confirmado')
      },
    })
  }

  function handleSendDelivery(orderId: string, snapWhatsapp?: string) {
    dialog.info({
      title: 'Enviar fotos',
      content: '¿Generar el enlace de descarga y marcar como entregado?',
      positiveText: 'Enviar fotos',
      negativeText: 'Cancelar',
      onPositiveClick: async () => {
        const result = await sendDelivery(orderId)
        message.success('Fotos enviadas')
        dialog.success({
          title: 'Enlace de descarga generado',
          content: result.deliveryUrl,
          positiveText: 'Enviar por WhatsApp',
          negativeText: 'Cerrar',
          onPositiveClick: () => {
            openWhatsApp(snapWhatsapp, result.whatsappTemplate)
          },
        })
      },
    })
  }

  function handleCancel(orderId: string, userName?: string) {
    dialog.error({
      title: 'Cancelar pedido',
      content: userName
        ? `¿Estás seguro de cancelar el pedido de ${userName}? Esta acción no se puede deshacer.`
        : '¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer.',
      positiveText: 'Cancelar pedido',
      negativeText: 'Volver',
      onPositiveClick: async () => {
        await cancelOrder(orderId)
        message.success('Pedido cancelado')
      },
    })
  }

  async function handleRegenerate(orderId: string, snapWhatsapp?: string) {
    const result = await regenerateDelivery(orderId)
    message.success('Enlace regenerado')
    dialog.success({
      title: 'Nuevo enlace de descarga',
      content: result.deliveryUrl,
      positiveText: 'Enviar por WhatsApp',
      negativeText: 'Cerrar',
      onPositiveClick: () => {
        openWhatsApp(snapWhatsapp, result.whatsappTemplate)
      },
    })
  }

  async function handleNotifyPaymentInfo(order: IOrderListItem) {
    try {
      await notifyPaymentInfo(order.id)
    } catch {
      message.error('No se pudo registrar el envío. Intenta de nuevo.')
      return
    }
    const firstName = order.userName.split(' ')[0] ?? order.userName
    const template = buildPaymentInfoTemplate({
      customerFirstName: firstName,
      photoCount: order.photoCount,
      eventName: order.eventName,
    })
    openWhatsApp(order.snapWhatsapp, template)
  }

  return {
    handleConfirmPayment,
    handleNotifyPaymentInfo,
    handleSendDelivery,
    handleCancel,
    handleRegenerate,
    isRegenerating,
  }
}
