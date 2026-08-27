<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { NButton, NIcon, NTag } from 'naive-ui'
import { useMediaQuery } from '@vueuse/core'
import { CloudUploadOutline, CreateOutline, EllipsisHorizontalOutline } from '@vicons/ionicons5'

import { formatDate, formatRelativeTime } from '@/shared/utils/date.utils'
import { formatLocation } from '@/shared/utils/location.utils'
import { EVENT_ROUTE_NAMES } from '../../../../routes'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'
import EventActionMenu from './EventActionMenu.vue'

type PickKey = 'edit' | 'configure' | 'gallery' | 'freeze' | 'quota' | 'archive'

const props = defineProps<{
  event: IEventDetail
  canEdit: boolean
  canFreeze: boolean
  canSetQuota: boolean
  canArchive: boolean
  showOrganizer: boolean
  menuOpen: boolean
}>()

const emit = defineEmits<{
  upload: []
  edit: []
  pick: [key: PickKey]
  'update:menuOpen': [value: boolean]
}>()

const isMobile = useMediaQuery('(max-width: 767px)')

const isSameDay = computed(() => props.event.startDate.getTime() === props.event.endDate.getTime())

const dateRangeLabel = computed(() =>
  isSameDay.value
    ? formatDate(props.event.startDate)
    : `${formatDate(props.event.startDate)} – ${formatDate(props.event.endDate)}`,
)

const locationLabel = computed(() => formatLocation(props.event) ?? 'Sin ubicación')

const isArchived = computed(() => props.event.status === 'archived')
const isFrozen = computed(() => props.event.isFrozen)

const isVisibleInGallery = computed(
  () => props.event.status === 'active' && props.event.coverImageSlug !== null,
)

const stateTagLabel = computed(() => {
  if (isArchived.value) return 'Archivado'
  return isVisibleInGallery.value ? 'Visible en la galería' : 'No visible'
})

const stateTagType = computed(() => {
  if (isArchived.value) return 'default'
  return isVisibleInGallery.value ? 'success' : 'warning'
})

const blockedLabel = computed(() => {
  if (isArchived.value) return 'Archivado · sin cambios'
  if (isFrozen.value) return 'Congelado · sin cambios'
  return null
})

function toggleMenu() {
  emit('update:menuOpen', !props.menuOpen)
}

function handleUpload() {
  emit('upload')
}

function handleEdit() {
  emit('edit')
}

function handlePick(key: PickKey) {
  emit('update:menuOpen', false)
  emit('pick', key)
}
</script>

<template>
  <div class="event-header">
    <nav class="event-header__breadcrumb" data-test="header-breadcrumb">
      <RouterLink :to="{ name: EVENT_ROUTE_NAMES.LIST }">Eventos</RouterLink>
      <span>›</span>
      <span>{{ event.name }}</span>
    </nav>

    <div class="event-header__row">
      <div class="event-header__info">
        <h1 class="event-header__title" data-test="header-title">{{ event.name }}</h1>
        <p class="event-header__meta" data-test="header-meta">
          <span>{{ dateRangeLabel }}</span>
          <span>·</span>
          <span>{{ locationLabel }}</span>
          <template v-if="showOrganizer">
            <span>·</span>
            <span>{{ event.organizerName }}</span>
          </template>
          <span>·</span>
          <span>Actualizado {{ formatRelativeTime(event.updatedAt) }}</span>
        </p>
        <div class="event-header__tags" data-test="header-tags">
          <NTag :type="stateTagType" size="small" round data-test="header-state-tag">
            {{ stateTagLabel }}
          </NTag>
          <NTag v-if="isFrozen" type="info" size="small" round data-test="header-frozen-tag">
            Congelado
          </NTag>
          <NTag size="small" round data-test="header-type-tag">{{ event.eventTypeName }}</NTag>
        </div>
      </div>

      <div class="event-header__actions">
        <span v-if="blockedLabel" class="event-header__blocked" data-test="header-blocked">
          {{ blockedLabel }}
        </span>
        <template v-else>
          <NButton type="primary" data-test="header-upload" @click="handleUpload">
            <template #icon><NIcon :component="CloudUploadOutline" /></template>
            Subir fotos
          </NButton>
          <NButton v-if="canEdit" data-test="header-edit" @click="handleEdit">
            <template #icon><NIcon :component="CreateOutline" /></template>
            Editar evento
          </NButton>
        </template>

        <div class="event-header__overflow">
          <NButton circle aria-label="Más acciones" data-test="header-overflow" @click="toggleMenu">
            <template #icon><NIcon :component="EllipsisHorizontalOutline" /></template>
          </NButton>
          <EventActionMenu
            v-if="menuOpen"
            class="event-header__menu"
            :event="event"
            :can-edit="canEdit"
            :can-freeze="canFreeze"
            :can-set-quota="canSetQuota"
            :can-archive="canArchive"
            :sheet="isMobile"
            data-test="header-menu"
            @pick="handlePick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./event-detail-header.css" />
