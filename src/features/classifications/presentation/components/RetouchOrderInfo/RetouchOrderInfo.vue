<script setup lang="ts">
import { NProgress, NSwitch, NIcon } from 'naive-ui'
import { PersonOutline, TimeOutline } from '@vicons/ionicons5'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import type { IRetouchQueueOrder } from '@/features/operator/types/responses/retouch-queue.response'

defineProps<{
  order: IRetouchQueueOrder
  progress: { retouched: number; total: number }
  showClassification: boolean
  totalOrders: number
}>()

const emit = defineEmits<{
  'update:showClassification': [value: boolean]
}>()
</script>

<template>
  <div class="retouch-info">
    <div class="retouch-info__section">
      <h4 class="retouch-info__label">Orden actual</h4>
      <div class="retouch-info__buyer">
        <NIcon :component="PersonOutline" :size="16" />
        <span>{{ order.buyerName }}</span>
      </div>
      <div class="retouch-info__time">
        <NIcon :component="TimeOutline" :size="14" />
        <span>{{ formatRelativeTime(order.createdAt) }}</span>
      </div>
    </div>

    <div class="retouch-info__section">
      <h4 class="retouch-info__label">Progreso de retoque</h4>
      <div class="retouch-info__progress-text">
        {{ progress.retouched }} / {{ progress.total }} fotos retocadas
      </div>
      <NProgress
        type="line"
        :percentage="
          progress.total > 0 ? Math.round((progress.retouched / progress.total) * 100) : 0
        "
        :show-indicator="false"
        :height="6"
        :border-radius="3"
      />
    </div>

    <div v-if="totalOrders > 1" class="retouch-info__section">
      <span class="retouch-info__queue-hint">
        {{ totalOrders - 1 }} orden{{ totalOrders - 1 !== 1 ? 'es' : '' }} más en cola
      </span>
    </div>

    <div class="retouch-info__divider" />

    <div class="retouch-info__toggle">
      <span>Activar clasificación</span>
      <NSwitch
        :value="showClassification"
        size="small"
        @update:value="emit('update:showClassification', $event)"
      />
    </div>
  </div>
</template>

<style scoped src="./retouch-order-info.css" />
