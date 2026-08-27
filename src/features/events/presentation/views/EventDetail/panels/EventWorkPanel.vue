<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NProgress } from 'naive-ui'
import { CheckmarkCircleOutline, CheckmarkDoneOutline } from '@vicons/ionicons5'

import type { IEventDetail } from '../../../../types/responses/event-detail.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{ event: IEventDetail }>()

const emit = defineEmits<{ 'start-review': [] }>()

const pendingReview = computed(() =>
  Math.max(0, props.event.photoCount - props.event.reviewedCount),
)

const reviewedPercent = computed(() =>
  props.event.photoCount === 0
    ? 0
    : Math.round((props.event.reviewedCount / props.event.photoCount) * 100),
)

const categorizedPercent = computed(() =>
  props.event.photoCount === 0
    ? 0
    : Math.round((props.event.categorizedCount / props.event.photoCount) * 100),
)
</script>

<template>
  <section class="work">
    <div class="work__head">
      <h4>Avance del trabajo</h4>
      <NButton
        v-if="pendingReview > 0"
        type="primary"
        size="small"
        data-test="work-start-review"
        @click="emit('start-review')"
      >
        <template #icon><NIcon :component="CheckmarkDoneOutline" /></template>
        Iniciar revisión
      </NButton>
      <span v-else-if="event.photoCount > 0" class="work__ok" data-test="work-all-ok">
        <NIcon :component="CheckmarkCircleOutline" :size="13" />
        Sin pendientes
      </span>
    </div>

    <div class="work__bars">
      <div data-test="work-reviewed">
        <div class="work__row">
          <span>Revisadas</span>
          <b>{{ formatNumber(event.reviewedCount) }} de {{ formatNumber(event.photoCount) }}</b>
        </div>
        <NProgress
          type="line"
          :percentage="reviewedPercent"
          :status="pendingReview > 0 ? 'warning' : 'success'"
          :height="6"
          :show-indicator="false"
        />
      </div>
      <div data-test="work-categorized">
        <div class="work__row">
          <span>Categorizadas</span>
          <b>{{ formatNumber(event.categorizedCount) }} de {{ formatNumber(event.photoCount) }}</b>
        </div>
        <NProgress
          type="line"
          :percentage="categorizedPercent"
          :height="6"
          :show-indicator="false"
        />
      </div>
    </div>

    <p class="work__note">
      Revisar y categorizar se hace en sus propias pantallas. Aquí solo se ve el avance. La revisión
      sigue permitida en eventos congelados.
    </p>
  </section>
</template>

<style scoped src="./event-work-panel.css" />
