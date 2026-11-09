<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import {
  AlertCircleOutline,
  ArchiveOutline,
  BanOutline,
  CloudUploadOutline,
  SnowOutline,
} from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import ArchivedInfoModal from '../../../components/ArchivedInfoModal/ArchivedInfoModal.vue'
import FrozenInfoModal from '../../../components/FrozenInfoModal/FrozenInfoModal.vue'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{ event: IEventDetail; canEdit: boolean }>()

const emit = defineEmits<{ 'upload-cover': [] }>()

const isFrozenInfoOpen = ref(false)
const isArchivedInfoOpen = ref(false)

const isClosedForWork = computed(() => props.event.isFrozen || props.event.status === 'archived')

const hasNoCover = computed(
  () => props.event.status === 'active' && props.event.coverImageSlug === null,
)

const isQuotaExhausted = computed(
  () =>
    props.event.status === 'active' &&
    props.event.photoQuota !== null &&
    props.event.photosUploaded >= props.event.photoQuota,
)

const deletedPhotos = computed(() =>
  Math.max(0, props.event.photosUploaded - props.event.photoCount),
)

const hasAny = computed(
  () =>
    hasNoCover.value ||
    props.event.isFrozen ||
    props.event.status === 'archived' ||
    isQuotaExhausted.value,
)
</script>

<template>
  <div v-if="hasAny" class="alerts" data-test="alerts">
    <div v-if="hasNoCover" class="alert alert--red" data-test="alert-cover">
      <NIcon :component="AlertCircleOutline" :size="17" />
      <div class="alert__text">
        <b>Sin imagen de portada: nadie puede comprar sus fotos.</b>
        <span>
          La galería pública solo muestra eventos activos con portada. Este evento está activo y
          publicado, pero es inalcanzable: no aparece en la galería, no se puede llegar a su carrito
          y no vende una sola foto.
        </span>
      </div>
      <NButton
        v-if="canEdit && !isClosedForWork"
        type="error"
        size="small"
        data-test="alert-upload-cover"
        @click="emit('upload-cover')"
      >
        <template #icon><NIcon :component="CloudUploadOutline" /></template>
        Subir portada
      </NButton>
    </div>

    <div v-if="event.isFrozen" class="alert alert--blue" data-test="alert-frozen">
      <NIcon :component="SnowOutline" :size="17" />
      <div class="alert__text">
        <b>
          <template v-if="event.frozenAt">
            Congelado el {{ formatDate(event.frozenAt) }}.
          </template>
          <template v-else>Congelado.</template>
          <button
            type="button"
            class="alert__link"
            data-test="alert-frozen-info"
            @click="isFrozenInfoOpen = true"
          >
            ¿Qué significa?
          </button>
        </b>
        <span>La venta sigue abierta; lo que se detiene es el trabajo sobre las fotos.</span>
      </div>
    </div>

    <div v-if="event.status === 'archived'" class="alert alert--red" data-test="alert-archived">
      <NIcon :component="ArchiveOutline" :size="17" />
      <div class="alert__text">
        <b>
          Archivado.
          <button
            type="button"
            class="alert__link"
            data-test="alert-archived-info"
            @click="isArchivedInfoOpen = true"
          >
            ¿Qué significa?
          </button>
        </b>
        <span>Nada se borró y se puede restaurar cuando quieras.</span>
      </div>
    </div>

    <div v-if="isQuotaExhausted" class="alert alert--amber" data-test="alert-quota">
      <NIcon :component="BanOutline" :size="17" />
      <div class="alert__text">
        <b>
          Cupo de fotos agotado: {{ formatNumber(event.photosUploaded) }} de
          {{ formatNumber(event.photoQuota ?? 0) }} consumidas.
        </b>
        <span>
          No se pueden subir más fotos. Borrar fotos no devuelve cupo<template
            v-if="deletedPhotos > 0"
          >
            — de hecho ya hay {{ formatNumber(deletedPhotos) }} borradas que siguen
            contando</template
          >.
        </span>
      </div>
    </div>

    <FrozenInfoModal v-model:show="isFrozenInfoOpen" />
    <ArchivedInfoModal v-model:show="isArchivedInfoOpen" />
  </div>
</template>

<style scoped src="./event-alerts.css" />
