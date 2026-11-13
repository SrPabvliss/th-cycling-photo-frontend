<script setup lang="ts">
import type { IPublicPhotoCategory } from '../../../types/responses/public-event-detail.response'

// Photo categories of an event ("Competencia", "Best trick"). The plate search that used to live
// here has its own form in the gallery.
defineProps<{
  categories: IPublicPhotoCategory[]
}>()

const selected = defineModel<number | null>({ required: true })
</script>

<template>
  <div class="gallery-categories" role="group" aria-label="Filtrar por categoría">
    <button
      type="button"
      class="gallery-categories__chip tt-hit-area"
      :aria-pressed="selected === null ? 'true' : 'false'"
      @click="selected = null"
    >
      Todas
    </button>
    <button
      v-for="category in categories"
      :key="category.id"
      type="button"
      class="gallery-categories__chip tt-hit-area"
      :aria-pressed="selected === category.id ? 'true' : 'false'"
      @click="selected = category.id"
    >
      {{ category.name }}
    </button>
  </div>
</template>

<style scoped>
.gallery-categories {
  display: flex;
  gap: var(--tt-space-2);
  /* Room for the chips' 44 px touch zone, which a scrolling row would otherwise clip. */
  padding-block: calc((var(--tt-control-m) - var(--tt-control-s)) / 2);
  margin-block: calc((var(--tt-control-m) - var(--tt-control-s)) / -2);
  overflow-x: auto;
  scrollbar-width: none;
}

.gallery-categories::-webkit-scrollbar {
  display: none;
}

.gallery-categories__chip {
  flex: none;
  block-size: var(--tt-control-s);
  padding-inline: calc(var(--tt-space-3) + var(--tt-space-1) / 2);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.gallery-categories__chip[aria-pressed='true'] {
  border-color: var(--tt-primary-soft-border);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
}
</style>
