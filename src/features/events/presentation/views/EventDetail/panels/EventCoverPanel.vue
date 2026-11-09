<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import {
  CameraOutline,
  CheckmarkCircleOutline,
  CloudUploadOutline,
  CopyOutline,
  ImageOutline,
  SwapHorizontalOutline,
  TrashOutline,
} from '@vicons/ionicons5'

import { env } from '@/core/config/env'
import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import { useRemoveAsset } from '@/features/event-assets/composables/mutations/use-remove-asset'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'

const props = defineProps<{ event: IEventDetail; canEdit: boolean }>()

const emit = defineEmits<{ 'upload-cover': [] }>()

const isClosedForWork = computed(() => props.event.isFrozen || props.event.status === 'archived')
const canManage = computed(() => props.canEdit && !isClosedForWork.value)

const hasCover = computed(() => props.event.coverImageSlug !== null)

const isVisible = computed(
  () => props.event.status === 'active' && props.event.coverImageSlug !== null,
)

const linkWarning = computed(() => {
  if (!hasCover.value) return 'Sin portada, el enlace no abre'
  return 'Archivado, el enlace no abre'
})

const coverUrl = computed(() =>
  props.event.coverImageSlug ? getAssetPresetUrl(props.event.coverImageSlug, 'cover-lg') : null,
)

const publicUrl = computed(() => `${env.VITE_APP_BASE_URL}/gallery/${props.event.slug}`)

const { mutate: removeAsset, isPending: isRemoving } = useRemoveAsset(props.event.id)

const statusTitle = computed(() => {
  if (!hasCover.value) return 'No visible: no vende'
  return props.event.status === 'archived' ? 'Tiene portada' : 'Visible en la galería'
})

const statusDescription = computed(() => {
  if (!hasCover.value) {
    return 'Mientras no tenga portada, el evento no aparece en la galería y ningún comprador puede llegar a sus fotos.'
  }
  return props.event.status === 'archived'
    ? 'Al restaurarlo vuelve a la galería con esta portada.'
    : 'Aparece en la galería pública y sus fotos se pueden comprar.'
})

async function copyPublicUrl() {
  await navigator.clipboard.writeText(publicUrl.value)
}
</script>

<template>
  <section class="cover">
    <div class="cover__head">
      <h4>Imagen de portada</h4>
    </div>
    <div class="cover__row">
      <div class="cover__preview">
        <img v-if="coverUrl" :src="coverUrl" :alt="event.name" class="cover__image" />
        <div v-else class="cover__placeholder">
          <NIcon :component="ImageOutline" :size="28" color="var(--tt-neutral-light)" />
        </div>
      </div>

      <div class="cover__info">
        <div
          class="cover__status"
          :class="hasCover ? 'cover__status--ok' : 'cover__status--bad'"
          data-test="cover-status"
        >
          <NIcon :component="hasCover ? CheckmarkCircleOutline : ImageOutline" :size="16" />
          <div class="cover__status-text">
            <b data-test="cover-status-title">{{ statusTitle }}</b>
            <span data-test="cover-status-desc">{{ statusDescription }}</span>
          </div>
        </div>

        <div class="cover__actions">
          <NButton
            v-if="canManage && !hasCover"
            type="primary"
            size="small"
            data-test="cover-upload"
            @click="emit('upload-cover')"
          >
            <template #icon><NIcon :component="CloudUploadOutline" /></template>
            Subir portada
          </NButton>
          <template v-if="canManage && hasCover">
            <NButton size="small" data-test="cover-replace" @click="emit('upload-cover')">
              <template #icon><NIcon :component="SwapHorizontalOutline" /></template>
              Reemplazar
            </NButton>
            <NButton
              size="small"
              :loading="isRemoving"
              data-test="cover-remove"
              @click="removeAsset('cover_image')"
            >
              <template #icon><NIcon :component="TrashOutline" /></template>
              Quitar
            </NButton>
          </template>
        </div>
      </div>
    </div>

    <div class="cover__link" data-test="cover-link-row">
      <NIcon :component="CameraOutline" :size="14" />
      <span class="cover__link-label">Galería pública</span>
      <a
        v-if="isVisible"
        :href="publicUrl"
        target="_blank"
        rel="noopener"
        class="cover__link-url"
        data-test="cover-public-url"
      >
        {{ publicUrl }}
      </a>
      <span v-else class="cover__link-url" data-test="cover-public-url">
        {{ publicUrl }}
      </span>
      <NButton
        v-if="isVisible"
        text
        type="primary"
        size="small"
        data-test="cover-copy"
        @click="copyPublicUrl"
      >
        <template #icon><NIcon :component="CopyOutline" /></template>
        Copiar
      </NButton>
      <span v-else class="cover__link-warning" data-test="cover-link-warning">
        {{ linkWarning }}
      </span>
    </div>
  </section>
</template>

<style scoped src="./event-cover-panel.css" />
