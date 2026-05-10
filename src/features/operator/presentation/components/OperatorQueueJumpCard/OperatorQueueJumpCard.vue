<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NCard, NIcon, NTooltip } from 'naive-ui'
import { ArrowForwardOutline } from '@vicons/ionicons5'

import { ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_LABELS } from '../../../constants/operator-activity'
import type { ActivityType } from '../../../types/operator-activity.types'

const props = defineProps<{
  kind: ActivityType
  count: number
  disabled?: boolean
  disabledHint?: string
}>()

defineEmits<{ click: [] }>()

const QUEUE_SUBTITLES: Record<ActivityType, string> = {
  review: 'Verifica las fotos antes de que el cliente las vea',
  retouch: 'Edita las fotos compradas y entrégalas',
}

const icon = computed(() => ACTIVITY_TYPE_ICONS[props.kind])
const title = computed(() => `Cola de ${ACTIVITY_TYPE_LABELS[props.kind]}`)
const subtitle = computed(() => QUEUE_SUBTITLES[props.kind])
</script>

<template>
  <NCard size="small" class="queue-jump" content-style="padding: 16px 18px;">
    <div class="queue-jump__row">
      <span class="queue-jump__icon" :class="`queue-jump__icon--${kind}`">
        <NIcon :component="icon" :size="20" />
      </span>

      <div class="queue-jump__body">
        <div class="queue-jump__title">{{ title }}</div>
        <div class="queue-jump__sub">{{ subtitle }}</div>
      </div>

      <div class="queue-jump__counter">
        <div class="queue-jump__count">{{ count }}</div>
        <div class="queue-jump__count-label">pendientes</div>
      </div>

      <NTooltip v-if="disabled" :disabled="!disabledHint">
        <template #trigger>
          <NButton type="primary" size="small" disabled>
            Ir
            <template #icon><NIcon :component="ArrowForwardOutline" /></template>
          </NButton>
        </template>
        {{ disabledHint }}
      </NTooltip>
      <NButton v-else type="primary" size="small" @click="$emit('click')">
        Ir
        <template #icon><NIcon :component="ArrowForwardOutline" /></template>
      </NButton>
    </div>
  </NCard>
</template>

<style scoped src="./operator-queue-jump-card.css" />
