<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NButton,
  NCheckbox,
  NEmpty,
  NIcon,
  NInput,
  NPopconfirm,
  NSelect,
  NTag,
  useMessage,
} from 'naive-ui'
import type { SelectGroupOption } from 'naive-ui'
import { AddOutline, CloseCircleOutline } from '@vicons/ionicons5'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import CollapsibleCard from '@/shared/components/CollapsibleCard/CollapsibleCard.vue'
import { usePhotoCategoriesQuery } from '../../../composables/queries/use-photo-categories'
import { usePhotoCategoryCatalogQuery } from '../../../composables/queries/use-photo-category-catalog'
import { useCreatePhotoCategory } from '../../../composables/mutations/use-create-photo-category'
import { useAssignPhotoCategory } from '../../../composables/mutations/use-assign-photo-category'
import { useUnassignPhotoCategory } from '../../../composables/mutations/use-unassign-photo-category'
import { groupPhotoCategories } from '../../../utils/group-photo-categories'
import { photoCategoryErrorMessage } from '../../../utils/photo-category-error'

const props = withDefaults(
  defineProps<{
    eventId: string
    editable?: boolean
  }>(),
  { editable: true },
)

const { has } = usePermissions()
const canCreateCategory = computed(() => has(PERMISSIONS.PHOTO_CATEGORY_CREATE))
const canManageBase = computed(() => has(PERMISSIONS.PHOTO_CATEGORY_BASE_MANAGE))
const message = useMessage()

const { data: assignedCategories } = usePhotoCategoriesQuery(() => props.eventId)
// Base + the event organizer's own categories (the admin sees the organizer's, not theirs).
const { data: catalog } = usePhotoCategoryCatalogQuery(() => props.eventId)
const { mutateAsync: createCategory, isPending: isCreating } = useCreatePhotoCategory()
const { mutateAsync: assignCategory } = useAssignPhotoCategory(() => props.eventId)
const { mutate: unassignCategory } = useUnassignPhotoCategory(() => props.eventId)

const newCategoryName = ref('')
const selectedCatalogId = ref<number | null>(null)
const createAsBase = ref(false)

const assignedIds = computed(() => new Set(assignedCategories.value?.map((c) => c.id) ?? []))

const availableToAssign = computed<SelectGroupOption[]>(() =>
  groupPhotoCategories((catalog.value ?? []).filter((c) => !assignedIds.value.has(c.id))).map(
    (group) => ({
      type: 'group',
      key: group.key,
      label: group.label,
      children: group.items.map((c) => ({ label: c.name, value: c.id })),
    }),
  ),
)

async function assignOrWarn(categoryId: number) {
  try {
    await assignCategory(categoryId)
  } catch (caught) {
    message.error(photoCategoryErrorMessage(caught))
  }
}

async function handleAssign() {
  if (!selectedCatalogId.value) return
  const categoryId = selectedCatalogId.value
  selectedCatalogId.value = null
  await assignOrWarn(categoryId)
}

async function handleCreateAndAssign() {
  const name = newCategoryName.value.trim()
  if (!name) return
  let createdId: number
  try {
    const { data } = await createCategory(
      canManageBase.value && createAsBase.value ? { name, base: true } : { name },
    )
    createdId = data.id
  } catch (caught) {
    message.error(photoCategoryErrorMessage(caught))
    return
  }
  newCategoryName.value = ''
  createAsBase.value = false
  await assignOrWarn(createdId)
}
</script>

<template>
  <CollapsibleCard
    title="Categorías de fotos"
    subtitle="Organiza las fotos por etapas o días"
    :default-expanded="false"
  >
    <div class="category-list">
      <NEmpty
        v-if="assignedCategories && assignedCategories.length === 0"
        description="Sin categorías asignadas"
        size="small"
        style="padding: 8px 0"
      />

      <div v-for="cat in assignedCategories" :key="cat.id" class="category-item">
        <div class="category-item__info">
          <span class="category-item__name">{{ cat.name }}</span>
          <NTag
            v-if="cat.scope === 'base'"
            size="tiny"
            :bordered="false"
            class="category-item__scope"
          >
            Base
          </NTag>
          <span class="category-item__count">{{ cat.photoCount }}</span>
        </div>
        <div v-if="editable" class="category-item__actions">
          <NPopconfirm @positive-click="unassignCategory(cat.id)">
            <template #trigger>
              <NButton text size="tiny" type="error">
                <template #icon><NIcon :component="CloseCircleOutline" :size="14" /></template>
              </NButton>
            </template>
            Quitar esta categoría del evento. Las fotos asociadas perderán su categoría.
          </NPopconfirm>
        </div>
      </div>
    </div>

    <div v-if="editable && availableToAssign.length > 0" class="category-assign">
      <NSelect
        v-model:value="selectedCatalogId"
        :options="availableToAssign"
        size="small"
        placeholder="Asignar categoría existente..."
        filterable
        clearable
      />
      <NButton size="small" :disabled="!selectedCatalogId" @click="handleAssign">
        <template #icon><NIcon :component="AddOutline" /></template>
      </NButton>
    </div>

    <NCheckbox
      v-if="editable && canCreateCategory && canManageBase"
      v-model:checked="createAsBase"
      size="small"
      class="category-add__base"
    >
      Crear como base (disponible para todos los organizadores)
    </NCheckbox>
    <div v-if="editable && canCreateCategory" class="category-add">
      <NInput
        v-model:value="newCategoryName"
        size="small"
        placeholder="Crear nueva categoría..."
        @keydown.enter.prevent="handleCreateAndAssign"
      />
      <NButton
        size="small"
        :loading="isCreating"
        :disabled="!newCategoryName.trim()"
        @click="handleCreateAndAssign"
      >
        <template #icon><NIcon :component="AddOutline" /></template>
      </NButton>
    </div>
  </CollapsibleCard>
</template>

<style scoped src="./photo-category-manager.css"></style>
