<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NSpin } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

import { usePhotoParticipantsQuery } from '../../../composables/queries/use-photo-cyclists'
import { useParticipantListState } from '../../../composables/use-cyclist-list-state'
import CyclistCard from '../CyclistCard/CyclistCard.vue'
import CyclistForm from '../CyclistForm/CyclistForm.vue'

const props = defineProps<{
  photoId: string
}>()

const photoIdRef = computed(() => props.photoId)
const { data: participants, isPending } = usePhotoParticipantsQuery(photoIdRef)

const {
  formMode,
  editingParticipantId,
  editingParticipantDetail,
  isLoadingDetail,
  showForm,
  isFormBusy,
  handleAdd,
  handleEdit,
  handleDelete,
  closeForm,
} = useParticipantListState(photoIdRef)
</script>

<template>
  <div class="cyclist-list">
    <div class="cyclist-list__header">
      <p class="cyclist-list__title">Ciclistas ({{ participants?.length ?? 0 }})</p>
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
      :key="editingParticipantId ?? 'new'"
      :photo-id="photoId"
      :cyclist="formMode === 'editing' ? (editingParticipantDetail ?? undefined) : undefined"
      @done="closeForm"
      @cancel="closeForm"
    />

    <NSpin :show="isPending" size="small">
      <div v-if="participants?.length" class="cyclist-list__items">
        <CyclistCard
          v-for="participant in participants"
          :key="participant.id"
          :cyclist="participant"
          @edit="handleEdit(participant)"
          @delete="handleDelete(participant)"
        />
      </div>
      <div v-else-if="!isPending" class="cyclist-list__empty">
        No hay ciclistas registrados en esta foto
      </div>
    </NSpin>
  </div>
</template>

<style scoped src="./cyclist-list.css" />
