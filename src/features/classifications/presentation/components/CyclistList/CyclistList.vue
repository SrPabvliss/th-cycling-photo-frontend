<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NSpin } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

import { usePhotoCyclistsQuery } from '../../../composables/queries/use-photo-cyclists'
import { useCyclistListState } from '../../../composables/use-cyclist-list-state'
import CyclistCard from '../CyclistCard/CyclistCard.vue'
import CyclistForm from '../CyclistForm/CyclistForm.vue'

const props = defineProps<{
  photoId: string
}>()

const photoIdRef = computed(() => props.photoId)
const { data: cyclists, isPending } = usePhotoCyclistsQuery(photoIdRef)

const {
  formMode,
  editingCyclistId,
  editingCyclistDetail,
  isLoadingDetail,
  showForm,
  isFormBusy,
  handleAdd,
  handleEdit,
  handleDelete,
  closeForm,
} = useCyclistListState(photoIdRef)
</script>

<template>
  <div class="cyclist-list">
    <div class="cyclist-list__header">
      <p class="cyclist-list__title">Ciclistas ({{ cyclists?.length ?? 0 }})</p>
      <NButton size="tiny" type="primary" :disabled="isFormBusy" @click="handleAdd">
        <template #icon><NIcon :component="AddOutline" /></template>
        Agregar
      </NButton>
    </div>

    <NSpin v-if="formMode === 'loading-edit'" :show="isLoadingDetail" size="small">
      <div style="min-height: 60px" />
    </NSpin>

    <CyclistForm
      v-if="showForm"
      :key="editingCyclistId ?? 'new'"
      :photo-id="photoId"
      :cyclist="formMode === 'editing' ? (editingCyclistDetail ?? undefined) : undefined"
      @done="closeForm"
      @cancel="closeForm"
    />

    <NSpin :show="isPending" size="small">
      <div v-if="cyclists?.length" class="cyclist-list__items">
        <CyclistCard
          v-for="cyclist in cyclists"
          :key="cyclist.id"
          :cyclist="cyclist"
          @edit="handleEdit(cyclist)"
          @delete="handleDelete(cyclist)"
        />
      </div>
      <div v-else-if="!isPending" class="cyclist-list__empty">
        No hay ciclistas registrados en esta foto
      </div>
    </NSpin>
  </div>
</template>

<style scoped src="./cyclist-list.css" />
