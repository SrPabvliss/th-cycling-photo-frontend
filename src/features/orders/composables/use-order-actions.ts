import { useDialog, useMessage } from 'naive-ui'

import { openWhatsApp } from '@/shared/utils/whatsapp.utils'
import { useConfirmPayment } from './mutations/use-confirm-payment'
import { useSendDelivery } from './mutations/use-send-delivery'
import { useCancelOrder } from './mutations/use-cancel-order'
import { useRegenerateDelivery } from './mutations/use-regenerate-delivery'

export function useOrderActions() {
  const dialog = useDialog()
  const message = useMessage()

  const { mutateAsync: confirmPayment } = useConfirmPayment()
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

  return {
    handleConfirmPayment,
    handleSendDelivery,
    handleCancel,
    handleRegenerate,
    isRegenerating,
  }
}
