<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NEmpty, NIcon, NInput, NPopconfirm, NSelect } from 'naive-ui'
import { AddOutline, CloseCircleOutline } from '@vicons/ionicons5'

import CollapsibleCard from '@/shared/components/CollapsibleCard.vue'
import { usePhotoCategoriesQuery } from '../../../composables/queries/use-photo-categories'
import { usePhotoCategoriesGlobalQuery } from '../../../composables/queries/use-photo-categories-global'
import { useCreatePhotoCategory } from '../../../composables/mutations/use-create-photo-category'
import { useAssignPhotoCategory } from '../../../composables/mutations/use-assign-photo-category'
import { useUnassignPhotoCategory } from '../../../composables/mutations/use-unassign-photo-category'

const props = defineProps<{
  eventId: string
}>()

const { data: assignedCategories } = usePhotoCategoriesQuery(() => props.eventId)
const { data: globalCategories } = usePhotoCategoriesGlobalQuery()
const { mutateAsync: createCategory, isPending: isCreating } = useCreatePhotoCategory()
const { mutate: assignCategory } = useAssignPhotoCategory(props.eventId)
const { mutate: unassignCategory } = useUnassignPhotoCategory(props.eventId)

const newCategoryName = ref('')
const selectedGlobalId = ref<number | null>(null)

const assignedIds = computed(() => new Set(assignedCategories.value?.map((c) => c.id) ?? []))

const availableToAssign = computed(
  () =>
    globalCategories.value
      ?.filter((c) => !assignedIds.value.has(c.id))
      .map((c) => ({ label: c.name, value: c.id })) ?? [],
)

function handleAssign() {
  if (!selectedGlobalId.value) return
  assignCategory(selectedGlobalId.value)
  selectedGlobalId.value = null
}

async function handleCreateAndAssign() {
  const name = newCategoryName.value.trim()
  if (!name) return
  const { data } = await createCategory(name)
  assignCategory(data.id)
  newCategoryName.value = ''
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
          <span class="category-item__count">{{ cat.photoCount }}</span>
        </div>
        <div class="category-item__actions">
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

    <div v-if="availableToAssign.length > 0" class="category-assign">
      <NSelect
        v-model:value="selectedGlobalId"
        :options="availableToAssign"
        size="small"
        placeholder="Asignar categoría existente..."
        filterable
        clearable
      />
      <NButton size="small" :disabled="!selectedGlobalId" @click="handleAssign">
        <template #icon><NIcon :component="AddOutline" /></template>
      </NButton>
    </div>

    <div class="category-add">
      <NInput
        v-model:value="newCategoryName"
        size="small"
        placeholder="Crear nueva categoría..."
        @keyup.enter="handleCreateAndAssign"
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
