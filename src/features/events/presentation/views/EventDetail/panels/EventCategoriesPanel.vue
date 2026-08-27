<script setup lang="ts">
import { computed } from 'vue'
import { NEmpty } from 'naive-ui'

import { usePhotoCategoriesQuery } from '@/features/photo-categories/composables/queries/use-photo-categories'
import PhotoCategoryManager from '@/features/photo-categories/presentation/components/PhotoCategoryManager/PhotoCategoryManager.vue'

const props = defineProps<{ eventId: string; canEdit: boolean }>()

const { data: categories } = usePhotoCategoriesQuery(() => props.eventId)

const hasCategories = computed(() => (categories.value?.length ?? 0) > 0)
</script>

<template>
  <section class="categories">
    <div class="categories__head">
      <h4>Categorías de fotos</h4>
    </div>
    <div v-if="hasCategories" class="categories__chips" data-test="categories-chips">
      <span
        v-for="category in categories"
        :key="category.id"
        class="categories__chip"
        data-test="categories-chip"
      >
        {{ category.name }}
        <span class="categories__count">{{ category.photoCount }}</span>
      </span>
    </div>
    <NEmpty
      v-else
      class="categories__empty"
      data-test="categories-empty"
      description="Ninguna categoría"
    >
      <template #extra>
        <span>Sin categorías, la galería muestra todas las fotos en una sola lista.</span>
      </template>
    </NEmpty>

    <PhotoCategoryManager v-if="canEdit" :event-id="eventId" :editable="canEdit" />
  </section>
</template>

<style scoped src="./event-categories-panel.css" />
