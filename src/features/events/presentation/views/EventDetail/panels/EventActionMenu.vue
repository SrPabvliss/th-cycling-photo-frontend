<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  ArchiveOutline,
  CreateOutline,
  ImagesOutline,
  OptionsOutline,
  RefreshOutline,
  SettingsOutline,
  SnowOutline,
} from '@vicons/ionicons5'

import type { IEventDetail } from '../../../../types/responses/event-detail.response'

type PickKey = 'edit' | 'configure' | 'gallery' | 'freeze' | 'quota' | 'archive'

const props = defineProps<{
  event: IEventDetail
  canEdit: boolean
  canFreeze: boolean
  canSetQuota: boolean
  canArchive: boolean
  sheet: boolean
}>()

const emit = defineEmits<{ pick: [key: PickKey] }>()

const blockedReason = computed(() => {
  if (props.event.status === 'archived') {
    return 'El evento está archivado. Restáuralo para volver a trabajarlo.'
  }
  if (props.event.isFrozen) {
    return 'El evento está congelado. Descongélalo para volver a trabajarlo.'
  }
  return null
})

const isClosedForWork = computed(() => blockedReason.value !== null)

const isVisibleInGallery = computed(
  () => props.event.status === 'active' && props.event.coverImageSlug !== null,
)

const galleryNote = computed(() =>
  isVisibleInGallery.value ? null : 'Aún no visible en la galería',
)

const freezeLabel = computed(() => (props.event.isFrozen ? 'Descongelar' : 'Congelar'))

const archiveLabel = computed(() =>
  props.event.status === 'archived' ? 'Restaurar evento' : 'Archivar evento',
)

function pick(key: PickKey) {
  emit('pick', key)
}
</script>

<template>
  <div class="action-menu" :class="{ 'action-menu--sheet': sheet }" data-test="action-menu">
    <div v-if="canEdit" class="action-menu__group" data-test="action-group-edit">
      <h5 class="action-menu__heading">Editar</h5>
      <button
        class="action-menu__item"
        type="button"
        :disabled="isClosedForWork"
        data-test="action-edit"
        @click="pick('edit')"
      >
        <NIcon :component="CreateOutline" :size="18" />
        <span class="action-menu__text">
          <b>Editar evento</b>
          <em v-if="isClosedForWork">{{ blockedReason }}</em>
        </span>
      </button>
      <button
        class="action-menu__item"
        type="button"
        :disabled="isClosedForWork"
        data-test="action-configure"
        @click="pick('configure')"
      >
        <NIcon :component="SettingsOutline" :size="18" />
        <span class="action-menu__text">
          <b>Configuración</b>
          <em>{{ isClosedForWork ? blockedReason : 'Marca y métodos de cobro del evento' }}</em>
        </span>
      </button>
    </div>

    <div class="action-menu__group" data-test="action-group-share">
      <h5 class="action-menu__heading">Compartir</h5>
      <button
        class="action-menu__item"
        type="button"
        data-test="action-gallery"
        @click="pick('gallery')"
      >
        <NIcon :component="ImagesOutline" :size="18" />
        <span class="action-menu__text">
          <b>Ver galería</b>
          <em v-if="galleryNote">{{ galleryNote }}</em>
        </span>
      </button>
    </div>

    <div class="action-menu__group" data-test="action-group-admin">
      <h5 class="action-menu__heading">Administración</h5>
      <button
        v-if="canFreeze"
        class="action-menu__item"
        type="button"
        :disabled="event.status === 'archived'"
        data-test="action-freeze"
        @click="pick('freeze')"
      >
        <NIcon :component="SnowOutline" :size="18" />
        <span class="action-menu__text">
          <b>{{ freezeLabel }}</b>
        </span>
      </button>
      <button
        v-if="canSetQuota"
        class="action-menu__item"
        type="button"
        :disabled="isClosedForWork"
        data-test="action-quota"
        @click="pick('quota')"
      >
        <NIcon :component="OptionsOutline" :size="18" />
        <span class="action-menu__text">
          <b>Cambiar el cupo de fotos</b>
          <em v-if="isClosedForWork">{{ blockedReason }}</em>
        </span>
      </button>
      <button
        v-if="canArchive"
        class="action-menu__item"
        :class="{ 'action-menu__item--danger': event.status !== 'archived' }"
        type="button"
        :disabled="event.isFrozen"
        data-test="action-archive"
        @click="pick('archive')"
      >
        <NIcon
          :component="event.status === 'archived' ? RefreshOutline : ArchiveOutline"
          :size="18"
        />
        <span class="action-menu__text">
          <b>{{ archiveLabel }}</b>
          <em v-if="event.isFrozen">{{ blockedReason }}</em>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped src="./event-action-menu.css" />
