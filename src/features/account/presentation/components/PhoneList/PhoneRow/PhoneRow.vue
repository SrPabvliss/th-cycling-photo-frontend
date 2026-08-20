<script setup lang="ts">
import { NButton, NIcon, NTag } from 'naive-ui'
import { LogoWhatsapp } from '@vicons/ionicons5'

import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import type { IUserPhone } from '../../../../types/responses/user-phone.response'

defineProps<{
  phone: IUserPhone
}>()

const emit = defineEmits<{
  edit: [phone: IUserPhone]
}>()

function metaLine(phone: IUserPhone): string {
  return phone.label ?? ''
}
</script>

<template>
  <div class="phone-list__row">
    <div
      class="phone-list__wa"
      :class="phone.isWhatsapp ? 'phone-list__wa--on' : 'phone-list__wa--off'"
      :title="phone.isWhatsapp ? 'Recibe mensajes por WhatsApp' : 'Sin WhatsApp'"
    >
      <NIcon :component="LogoWhatsapp" :size="20" />
    </div>

    <div class="phone-list__row-info">
      <div class="phone-list__row-number">
        <span>{{ formatWhatsAppNumber(phone.phoneNumber) }}</span>
        <NTag v-if="phone.isPrimary" size="small" :bordered="false" class="phone-list__primary-tag">
          Principal
        </NTag>
      </div>
      <div class="phone-list__row-meta">
        {{ metaLine(phone) || (phone.isWhatsapp ? 'Recibe WhatsApp' : 'Sin WhatsApp') }}
      </div>
    </div>

    <NButton text type="primary" class="phone-list__edit-btn" @click="emit('edit', phone)">
      Editar
    </NButton>
  </div>
</template>

<style scoped src="./phone-row.css"></style>
