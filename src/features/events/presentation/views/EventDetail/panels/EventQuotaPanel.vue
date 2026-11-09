<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NProgress } from 'naive-ui'
import { DocumentTextOutline } from '@vicons/ionicons5'

import type { IEventDetail } from '../../../../types/responses/event-detail.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{ event: IEventDetail; canSetQuota: boolean }>()

const emit = defineEmits<{ 'change-quota': [] }>()

const isClosedForWork = computed(() => props.event.isFrozen || props.event.status === 'archived')

const isUnlimited = computed(() => props.event.photoQuota === null)

const isExhausted = computed(
  () => props.event.photoQuota !== null && props.event.photosUploaded >= props.event.photoQuota,
)

const remaining = computed(() =>
  props.event.photoQuota === null
    ? 0
    : Math.max(0, props.event.photoQuota - props.event.photosUploaded),
)

const percent = computed(() =>
  props.event.photoQuota === null || props.event.photoQuota === 0
    ? 0
    : Math.min(100, Math.round((props.event.photosUploaded / props.event.photoQuota) * 100)),
)

const tone = computed(() => {
  if (isExhausted.value) return 'error'
  if (percent.value >= 85) return 'warning'
  return 'success'
})

const deletedPhotos = computed(() =>
  Math.max(0, props.event.photosUploaded - props.event.photoCount),
)

const pendingReview = computed(() =>
  Math.max(0, props.event.photoCount - props.event.reviewedCount),
)

const uncategorized = computed(() =>
  Math.max(0, props.event.photoCount - props.event.categorizedCount),
)
</script>

<template>
  <section class="quota" :class="`quota--${tone}`">
    <div class="quota__main">
      <span class="quota__label">Cupo de fotos</span>
      <span class="quota__value" data-test="quota-value">
        <template v-if="isUnlimited">Sin límite</template>
        <template v-else-if="isExhausted">Cupo agotado</template>
        <template v-else>
          {{ formatNumber(remaining) }}
          <em>de {{ formatNumber(event.photoQuota ?? 0) }} disponibles</em>
        </template>
      </span>
      <NProgress
        v-if="!isUnlimited"
        data-test="quota-bar"
        type="line"
        :percentage="percent"
        :status="tone"
        :height="6"
        :show-indicator="false"
      />
      <span class="quota__note" data-test="quota-note">
        {{ formatNumber(event.photosUploaded) }} fotos consumidas del cupo ·
        {{ formatNumber(event.photoCount) }} en línea ahora<template v-if="deletedPhotos > 0">
          · {{ formatNumber(deletedPhotos) }} borradas que no devuelven cupo</template
        >
      </span>
      <span v-if="event.contractName" class="quota__contract" data-test="quota-contract">
        <NIcon :component="DocumentTextOutline" :size="13" />
        {{ event.contractName }}
        <NButton
          v-if="canSetQuota && !isClosedForWork"
          text
          type="primary"
          size="small"
          data-test="quota-change"
          @click="emit('change-quota')"
        >
          Cambiar el cupo
        </NButton>
      </span>
    </div>
    <div class="quota__side" data-test="quota-side">
      <div>
        <b>{{ formatNumber(event.photoCount) }}</b>
        <span>Fotos en línea</span>
      </div>
      <div>
        <b :class="{ 'quota__side--bad': pendingReview > 0 }">{{ formatNumber(pendingReview) }}</b>
        <span>Por revisar</span>
      </div>
      <div>
        <b>{{ formatNumber(uncategorized) }}</b>
        <span>Sin categoría</span>
      </div>
    </div>
  </section>
</template>

<style scoped src="./event-quota-panel.css" />
