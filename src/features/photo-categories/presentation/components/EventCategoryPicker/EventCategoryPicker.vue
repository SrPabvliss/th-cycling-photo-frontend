<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NIcon, NInput } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

import { usePhotoCategoriesGlobalQuery } from '../../../composables/queries/use-photo-categories-global'

const props = defineProps<{
  selectedIds: number[]
}>()

const emit = defineEmits<{
  'update:selectedIds': [ids: number[]]
  'create-new': [name: string]
}>()

const { data: globalCategories } = usePhotoCategoriesGlobalQuery()
const newCategoryName = ref('')

const displayCategories = computed(() => globalCategories.value ?? [])

function toggleCategory(id: number) {
  if (props.selectedIds.includes(id)) {
    emit(
      'update:selectedIds',
      props.selectedIds.filter((i) => i !== id),
    )
  } else {
    emit('update:selectedIds', [...props.selectedIds, id])
  }
}

function handleCreateNew() {
  const name = newCategoryName.value.trim()
  if (!name) return
  emit('create-new', name)
  newCategoryName.value = ''
}
</script>

<template>
  <div class="category-picker">
    <div>
      <p class="category-picker__label">Categorías de fotos</p>
      <p class="category-picker__hint">
        Selecciona las etapas para organizar las fotos del evento.
      </p>
    </div>

    <div v-if="displayCategories.length > 0" class="category-picker__chips">
      <button
        v-for="cat in displayCategories"
        :key="cat.id"
        type="button"
        :class="['category-chip', { 'category-chip--selected': selectedIds.includes(cat.id) }]"
        @click="toggleCategory(cat.id)"
      >
        {{ cat.name }}
      </button>
    </div>

    <div class="category-picker__add">
      <NInput
        v-model:value="newCategoryName"
        size="small"
        placeholder="Crear nueva categoría..."
        @keyup.enter="handleCreateNew"
      />
      <NButton size="small" :disabled="!newCategoryName.trim()" @click="handleCreateNew">
        <template #icon><NIcon :component="AddOutline" /></template>
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./event-category-picker.css"></style>
