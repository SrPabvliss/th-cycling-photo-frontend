<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CheckmarkCircle } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { formatFileSize } from '@/shared/utils/format.utils'
import type { IDeliveryData } from '../../../types/responses/delivery-data.response'

const props = defineProps<{
  delivery: IDeliveryData
}>()

const totalSize = props.delivery.photos.reduce((sum, p) => sum + p.fileSize, 0)
</script>

<template>
  <div class="dh">
    <div class="dh__hero">
      <span class="dh__code">OK</span>
      <div class="dh__icon">
        <NIcon :component="CheckmarkCircle" :size="56" color="#fff" />
      </div>
    </div>
    <h1 class="dh__title">¡Tus fotos están listas!</h1>
    <p class="dh__subtitle">{{ delivery.customerName }} · {{ delivery.eventName }}</p>
    <div class="dh__stats">
      <span>{{ delivery.photos.length }} fotos</span>
      <span class="dh__dot" />
      <span>{{ formatFileSize(totalSize) }}</span>
      <span class="dh__dot" />
      <span>Disponible hasta {{ formatDate(delivery.expiresAt) }}</span>
    </div>
  </div>
</template>

<style scoped src="./delivery-header.css" />
