<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NCheckbox, NIcon, NInput } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { usePhotoCategoryCatalogQuery } from '../../../composables/queries/use-photo-category-catalog'
import type { ICreatePhotoCategoryRequest } from '../../../types/requests/create-photo-category.request'
import { groupPhotoCategories } from '../../../utils/group-photo-categories'

const props = defineProps<{
  selectedIds: number[]
  /** Existing event: lists its organizer's categories. Omit while creating one. */
  eventId?: string | null
}>()

const emit = defineEmits<{
  'update:selectedIds': [ids: number[]]
  'create-new': [request: ICreatePhotoCategoryRequest]
}>()

const { data: catalog } = usePhotoCategoryCatalogQuery(() => props.eventId)
const newCategoryName = ref('')
const createAsBase = ref(false)
const { has } = usePermissions()
const canCreateCategory = computed(() => has(PERMISSIONS.PHOTO_CATEGORY_CREATE))
const canManageBase = computed(() => has(PERMISSIONS.PHOTO_CATEGORY_BASE_MANAGE))

const groups = computed(() => groupPhotoCategories(catalog.value ?? []))

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
  emit('create-new', canManageBase.value && createAsBase.value ? { name, base: true } : { name })
  newCategoryName.value = ''
  createAsBase.value = false
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

    <div
      v-for="group in groups"
      :key="group.key"
      class="category-picker__group"
      :data-test="`category-group-${group.key}`"
    >
      <p class="category-picker__group-label">{{ group.label }}</p>
      <div class="category-picker__chips">
        <button
          v-for="cat in group.items"
          :key="cat.id"
          type="button"
          :class="['category-chip', { 'category-chip--selected': selectedIds.includes(cat.id) }]"
          @click="toggleCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div v-if="canCreateCategory" class="category-picker__create">
      <div class="category-picker__add">
        <NInput
          v-model:value="newCategoryName"
          size="small"
          placeholder="Crear nueva categoría..."
          @keydown.enter.prevent="handleCreateNew"
        />
        <NButton size="small" :disabled="!newCategoryName.trim()" @click="handleCreateNew">
          <template #icon><NIcon :component="AddOutline" /></template>
        </NButton>
      </div>
      <NCheckbox v-if="canManageBase" v-model:checked="createAsBase" size="small">
        Crear como base (disponible para todos los organizadores)
      </NCheckbox>
    </div>
  </div>
</template>

<style scoped src="./event-category-picker.css"></style>
