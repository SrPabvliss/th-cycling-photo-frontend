import { h } from 'vue'
import { NIcon, useDialog, useMessage } from 'naive-ui'
import { GiftOutline } from '@vicons/ionicons5'

import { buildPaymentInfoTemplate, openWhatsApp } from '@/shared/utils/whatsapp.utils'
import { useConfirmPayment } from './mutations/use-confirm-payment'
import { useMarkGift } from './mutations/use-mark-gift'
import { useNotifyPaymentInfo } from './mutations/use-notify-payment-info'
import { useSendDelivery } from './mutations/use-send-delivery'
import { useCancelOrder } from './mutations/use-cancel-order'
import { useRegenerateDelivery } from './mutations/use-regenerate-delivery'
import { buildConversionMessage } from '../utils/conversion-message'
import { useConvertToGift } from './mutations/use-convert-to-gift'
import { useConvertToSale } from './mutations/use-convert-to-sale'
import type { IOrderListItem } from '../types/responses/order-list.response'

interface IConvertibleOrder {
  id: string
  subtotal: number | null
  snapCurrency: string | null
}

export function useOrderActions() {
  const dialog = useDialog()
  const message = useMessage()

  const { mutateAsync: confirmPayment } = useConfirmPayment()
  const { mutateAsync: markGift } = useMarkGift()
  const { mutateAsync: notifyPaymentInfo } = useNotifyPaymentInfo()
  const { mutateAsync: sendDelivery } = useSendDelivery()
  const { mutateAsync: cancelOrder } = useCancelOrder()
  const { mutateAsync: regenerateDelivery, isPending: isRegenerating } = useRegenerateDelivery()
  const { mutateAsync: convertToSale, isPending: isConvertingToSale } = useConvertToSale()
  const { mutateAsync: convertToGift, isPending: isConvertingToGift } = useConvertToGift()

  function handleConfirmPayment(orderId: string) {
    dialog.info({
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

  function handleMarkGift(orderId: string) {
    dialog.create({
      title: 'Marcar como regalo',
      content:
        '¿Seguro que deseas marcar este pedido como regalo? No se sumará a las ganancias del mes.',
      icon: () => h(NIcon, { color: '#7c3aed' }, { default: () => h(GiftOutline) }),
      positiveText: 'Marcar como regalo',
      negativeText: 'Cancelar',
      positiveButtonProps: { color: '#7c3aed', textColor: '#ffffff' },
      onPositiveClick: async () => {
        await markGift(orderId)
        message.success('Pedido marcado como regalo')
      },
    })
  }

  function handleConvertToSale(order: IConvertibleOrder) {
    dialog.info({
      title: 'Cambiar a venta',
      content: buildConversionMessage('sale', order.subtotal, order.snapCurrency),
      positiveText: 'Cambiar a venta',
      negativeText: 'Cancelar',
      onPositiveClick: async () => {
        await convertToSale(order.id)
        message.success('Pedido cambiado a venta')
      },
    })
  }

  function handleConvertToGift(order: IConvertibleOrder) {
    dialog.create({
      title: 'Cambiar a regalo',
      content: buildConversionMessage('gift', order.subtotal, order.snapCurrency),
      icon: () => h(NIcon, { color: '#7c3aed' }, { default: () => h(GiftOutline) }),
      positiveText: 'Cambiar a regalo',
      negativeText: 'Cancelar',
      positiveButtonProps: { color: '#7c3aed', textColor: '#ffffff' },
      onPositiveClick: async () => {
        await convertToGift(order.id)
        message.success('Pedido cambiado a regalo')
      },
    })
  }

  function handleSendDelivery(orderId: string, snapWhatsapp?: string) {
    dialog.success({
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
      totalPrice: order.subtotal,
      currency: order.snapCurrency,
    })
    openWhatsApp(order.snapWhatsapp, template)
  }

  return {
    handleConfirmPayment,
    handleMarkGift,
    handleConvertToSale,
    handleConvertToGift,
    handleNotifyPaymentInfo,
    handleSendDelivery,
    handleCancel,
    handleRegenerate,
    isRegenerating,
    isConvertingToSale,
    isConvertingToGift,
  }
}
