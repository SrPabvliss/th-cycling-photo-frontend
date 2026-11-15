<script setup lang="ts">
import { computed } from 'vue'

import { eventDateLabel } from '@/shared/public-events'
import type { IPhotoSelection } from '../../../composables/use-photo-selection'
import type { IPreviewData } from '../../../types/responses/preview-data.response'
import PreviewTile from '../PreviewTile/PreviewTile.vue'

const props = defineProps<{
  preview: IPreviewData
  selection: IPhotoSelection
}>()

const emit = defineEmits<{
  open: [photoId: string]
}>()

const dayOf = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const date = computed(() =>
  eventDateLabel(dayOf(props.preview.startDate), dayOf(props.preview.endDate)),
)
const count = computed(() => props.preview.photos.length)

function toggleAll() {
  if (props.selection.allSelected.value) props.selection.clear()
  else props.selection.selectAll()
}
</script>

<template>
  <section class="preview-picker">
    <header class="preview-picker__head">
      <span class="preview-picker__eyebrow">Vista previa privada · {{ date }}</span>
      <h1 class="preview-picker__title">Tus fotos de {{ preview.eventName }}</h1>
      <p class="preview-picker__text">
        {{ preview.organizerName }} te compartió estas fotos. Elige las que quieras comprar.
      </p>
    </header>

    <div class="preview-picker__count">
      <span>{{ count === 1 ? '1 foto' : `${count} fotos` }}</span>
      <button type="button" class="preview-picker__all" @click="toggleAll">
        {{ selection.allSelected.value ? 'Quitar todas' : 'Elegir todas' }}
      </button>
    </div>

    <div class="preview-picker__grid">
      <PreviewTile
        v-for="photo in preview.photos"
        :key="photo.id"
        :photo="photo"
        :selected="selection.isSelected(photo.id)"
        @open="emit('open', $event)"
        @toggle="selection.toggle($event)"
      />
    </div>
  </section>
</template>

<style scoped>
.preview-picker {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
}

.preview-picker__head {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
}

.preview-picker__eyebrow {
  color: var(--tt-primary-ink);
  font-size: var(--tt-type-eyebrow-size);
  line-height: var(--tt-type-eyebrow-line);
  font-weight: var(--tt-type-eyebrow-weight);
  letter-spacing: var(--tt-type-eyebrow-tracking);
  text-transform: uppercase;
}

.preview-picker__title {
  margin: 0;
  font-family: var(--tt-type-display-s-family);
  font-stretch: var(--tt-display-stretch);
  font-size: var(--tt-type-display-s-size);
  line-height: var(--tt-type-display-s-line);
  font-weight: var(--tt-type-display-s-weight);
  text-transform: uppercase;
}

.preview-picker__text {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
}

.preview-picker__count {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
}

.preview-picker__all {
  min-block-size: var(--tt-control-s);
  padding: 0;
  border: 0;
  background: none;
  color: var(--tt-primary-ink);
  font: inherit;
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.preview-picker__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--tt-space-2);
}

@media (min-width: 768px) {
  .preview-picker__title {
    font-size: var(--tt-type-display-m-size);
    line-height: var(--tt-type-display-m-line);
  }

  .preview-picker__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--tt-space-3);
  }
}
</style>
