<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NTag } from 'naive-ui'
import { LogoWhatsapp, CopyOutline, RefreshOutline } from '@vicons/ionicons5'
import { useClipboard } from '@vueuse/core'

import { formatDate } from '@/shared/utils/date.utils'
import { DELIVERY_LINK_STATUS } from '../../../types/responses/order-detail.response'
import type { IOrderDetailDeliveryLink } from '../../../types/responses/order-detail.response'
import { DELIVERY_LINK_STATUS_CONFIG } from '../../../constants/status-config'

const props = defineProps<{
  deliveryLink: IOrderDetailDeliveryLink
  isRegenerating: boolean
}>()

const emit = defineEmits<{
  sendWhatsApp: []
  regenerate: []
}>()

const deliveryUrl = computed(() => {
  const base = window.location.origin
  return `${base}/delivery/${props.deliveryLink.token}`
})

const isExpired = computed(() => props.deliveryLink.status === DELIVERY_LINK_STATUS.EXPIRED)
const statusConfig = computed(() => DELIVERY_LINK_STATUS_CONFIG[props.deliveryLink.status])

const { copy, copied } = useClipboard({ source: deliveryUrl })
</script>

<template>
  <div class="dl-card">
    <div class="dl-card__header">
      <span class="dl-card__title">Enlace de descarga</span>
      <NTag :type="statusConfig.type" size="small" round :bordered="false">
        {{ statusConfig.label }}
      </NTag>
    </div>

    <template v-if="!isExpired">
      <div class="dl-card__url-row">
        <code class="dl-card__url">{{ deliveryUrl }}</code>
        <NButton size="tiny" quaternary @click="copy(deliveryUrl)">
          <template #icon><NIcon :component="CopyOutline" /></template>
          {{ copied ? 'Copiado' : 'Copiar' }}
        </NButton>
      </div>

      <div class="dl-card__meta">
        <span>Expira: {{ formatDate(deliveryLink.expiresAt) }}</span>
        <span>Descargas: {{ deliveryLink.downloadCount }}</span>
      </div>

      <NButton type="success" size="small" @click="emit('sendWhatsApp')">
        <template #icon><NIcon :component="LogoWhatsapp" /></template>
        Enviar por WhatsApp
      </NButton>
    </template>

    <template v-else>
      <p class="dl-card__expired-msg">
        Este enlace ha expirado. Genera uno nuevo para reenviarlo al cliente.
      </p>
      <NButton size="small" :loading="isRegenerating" @click="emit('regenerate')">
        <template #icon><NIcon :component="RefreshOutline" /></template>
        Regenerar enlace
      </NButton>
    </template>
  </div>
</template>

<style scoped src="./delivery-link-card.css" />
