<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  CalendarOutline,
  CameraOutline,
  ChevronForward,
  CloudUploadOutline,
  ImageOutline,
  LocationOutline,
} from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { formatLocation } from '@/shared/utils/location.utils'
import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import { formatCurrency } from '@/shared/utils/currency.utils'
import FrozenBadge from '../FrozenBadge/FrozenBadge.vue'
import type { EventRole } from '../../../types/event-role'
import type { IEventListItem } from '../../../types/responses/event-list.response'

const NEAR_QUOTA_PERCENT = 85

const props = defineProps<{
  event: IEventListItem
  role: EventRole
}>()

const emit = defineEmits<{
  view: [slug: IEventListItem['slug']]
  upload: [slug: IEventListItem['slug']]
}>()

const displayLocation = computed(() => formatLocation(props.event))

/** Cover card variant (400px/q80) — keeps memory/bandwidth low in lists. */
const coverUrl = computed(() =>
  props.event.coverImageSlug ? getAssetPresetUrl(props.event.coverImageSlug, 'cover-sm') : null,
)
const showNoCover = computed(() => !coverUrl.value)

const startDate = computed(() => props.event.startDate)
const endDate = computed(() => props.event.endDate)

const isQuotaExhausted = computed(() => {
  if (props.event.photoQuota === null) return false
  return props.event.photosUploaded >= props.event.photoQuota
})

const isQuotaNear = computed(() => {
  if (props.event.photoQuota === null || isQuotaExhausted.value) return false
  return (props.event.photosUploaded / props.event.photoQuota) * 100 >= NEAR_QUOTA_PERCENT
})

const quotaRemaining = computed(() => {
  if (props.event.photoQuota === null) return null
  return Math.max(0, props.event.photoQuota - props.event.photosUploaded)
})

const quotaPercent = computed(() => {
  if (props.event.photoQuota === null) return 0
  return Math.min(100, Math.round((props.event.photosUploaded / props.event.photoQuota) * 100))
})

const quotaTone = computed(() => {
  if (isQuotaExhausted.value) return 'red'
  if (isQuotaNear.value) return 'amber'
  return 'green'
})

const isEmpty = computed(() => props.event.photoCount === 0)

const canUpload = computed(
  () =>
    isEmpty.value && !props.event.isFrozen && !isQuotaExhausted.value && !props.event.isArchived,
)

const pendingReview = computed(() => props.event.photoCount - props.event.reviewedCount)
const uncategorized = computed(() => props.event.photoCount - props.event.categorizedCount)

const orderCount = computed(
  () =>
    props.event.paidCount +
    props.event.deliveredCount +
    props.event.giftedCount +
    props.event.unpaidCount,
)

const revenueLabel = computed(() =>
  Number(props.event.revenue) > 0 ? formatCurrency(Number(props.event.revenue), 'USD') : '—',
)

const organizerInitials = computed(() =>
  props.event.organizerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase(),
)

function handleView() {
  emit('view', props.event.slug)
}

function handleUpload() {
  emit('upload', props.event.slug)
}
</script>

<template>
  <article
    class="ev-card"
    :class="{
      'ev-card--blocked': event.alert === 'no_cover' || event.alert === 'quota_exhausted',
      'ev-card--archived': event.isArchived,
    }"
    @click="handleView"
  >
    <!-- Cover -->
    <div
      class="ev-cover"
      :class="{ 'ev-cover--none': showNoCover, 'ev-cover--dim': event.isArchived }"
    >
      <img
        v-if="!showNoCover"
        :src="coverUrl!"
        :alt="event.name"
        class="ev-cover__image"
        loading="lazy"
        decoding="async"
        @load="($event.target as HTMLImageElement).dataset.loaded = 'true'"
      />

      <div class="ev-cover__chips">
        <FrozenBadge v-if="event.isFrozen" variant="overlay" />
        <span v-if="event.isArchived" class="ev-chip ev-chip--archived">Archivado</span>
      </div>

      <template v-if="showNoCover">
        <span class="ev-cover__empty">
          <NIcon :component="ImageOutline" :size="17" />
          <b>Sin portada</b>
          <i>no aparece en la galería</i>
        </span>
      </template>
      <template v-else>
        <span class="ev-cover__photos">
          <NIcon :component="CameraOutline" :size="12" />
          {{ event.photoCount === 0 ? 'Sin fotos' : `${event.photoCount} fotos` }}
        </span>
      </template>
    </div>

    <!-- Body -->
    <div class="ev-body">
      <div class="ev-head">
        <h3 class="ev-title">{{ event.name }}</h3>
        <div class="ev-meta">
          <NIcon :component="CalendarOutline" :size="12" />
          <span v-if="startDate.getTime() === endDate.getTime()">{{ formatDate(startDate) }}</span>
          <span v-else>{{ formatDate(startDate) }} – {{ formatDate(endDate) }}</span>
          <template v-if="displayLocation">
            <i>·</i>
            <NIcon :component="LocationOutline" :size="12" />
            <span class="ev-ellip">{{ displayLocation }}</span>
          </template>
        </div>
      </div>

      <div v-if="role === 'titan'" class="ev-org">
        <span class="ev-org__avatar">{{ organizerInitials }}</span>
        <span class="ev-ellip">{{ event.organizerName }}</span>
      </div>

      <div class="ev-quota">
        <div class="ev-quota__head">
          <span>Cupo de fotos</span>
          <b v-if="event.photoQuota === null">Sin límite</b>
          <b v-else :class="`ev-quota__value--${quotaTone}`">
            {{ isQuotaExhausted ? 'Cupo agotado' : `${quotaRemaining} disponibles` }}
          </b>
        </div>
        <div class="ev-bar">
          <i
            v-if="event.photoQuota === null"
            class="ev-bar__fill ev-bar__fill--grey"
            style="width: 100%; opacity: 0.35"
          />
          <i
            v-else
            class="ev-bar__fill"
            :class="`ev-bar__fill--${quotaTone}`"
            :style="{ width: quotaPercent + '%' }"
          />
        </div>
        <span class="ev-quota__note">
          {{
            event.photoQuota === null
              ? `${event.photosUploaded} subidas en total`
              : `${event.photosUploaded} de ${event.photoQuota} consumidas`
          }}
        </span>
      </div>

      <div class="ev-minis">
        <template v-if="role === 'operator'">
          <div class="ev-mini">
            <span class="ev-mini__value">{{ event.photoCount }}</span>
            <span class="ev-mini__label">Fotos en línea</span>
          </div>
          <div class="ev-mini">
            <span class="ev-mini__value" :class="{ 'ev-mini__value--amber': pendingReview > 0 }">
              {{ pendingReview }}
            </span>
            <span class="ev-mini__label">Por revisar</span>
          </div>
          <div class="ev-mini">
            <span class="ev-mini__value">{{ uncategorized }}</span>
            <span class="ev-mini__label">Sin categoría</span>
          </div>
        </template>
        <template v-else>
          <div class="ev-mini">
            <span class="ev-mini__value">{{ revenueLabel }}</span>
            <span class="ev-mini__label">Ingresos</span>
          </div>
          <div class="ev-mini">
            <span
              class="ev-mini__value"
              :class="{ 'ev-mini__value--amber': event.unpaidCount > 0 }"
            >
              {{ orderCount || '—' }}
            </span>
            <span class="ev-mini__label">Pedidos</span>
          </div>
          <div class="ev-mini">
            <span class="ev-mini__value" :class="{ 'ev-mini__value--amber': pendingReview > 0 }">
              {{ pendingReview }}
            </span>
            <span class="ev-mini__label">Por revisar</span>
          </div>
        </template>
      </div>

      <div class="ev-foot">
        <button
          v-if="canUpload"
          type="button"
          class="ev-btn ev-btn--solid"
          @click.stop="handleUpload"
        >
          <NIcon :component="CloudUploadOutline" :size="14" />
          Subir fotos
        </button>
        <button v-else type="button" class="ev-btn ev-btn--ghost" @click.stop="handleView">
          Ver detalle
          <NIcon :component="ChevronForward" :size="14" />
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped src="./event-card.css" />
