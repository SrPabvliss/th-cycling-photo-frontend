<script setup lang="ts">
import { NButton, NIcon, useMessage } from 'naive-ui'
import { CheckmarkCircleOutline, ArrowForwardOutline } from '@vicons/ionicons5'

import { useClassifyPhoto } from '../../../composables/mutations/use-classify-photo'

const props = defineProps<{
  photoId: string
  eventId: string
  isClassified: boolean
  hasNext: boolean
  cyclistCount: number
  groupSize?: number
}>()

const emit = defineEmits<{
  next: []
}>()

const message = useMessage()
const classifyMutation = useClassifyPhoto()

async function handleClassifyAndAdvance() {
  if (!props.isClassified) {
    try {
      await classifyMutation.mutateAsync({ photoId: props.photoId, eventId: props.eventId })
      message.success('Foto clasificada')
    } catch {
      message.error('Error al clasificar la foto')
      return
    }
  }

  if (props.hasNext) {
    emit('next')
  }
}

function handleSkip() {
  if (props.hasNext) {
    emit('next')
  }
}
</script>

<template>
  <div class="photo-actions">
    <template v-if="!groupSize || groupSize <= 1">
      <NButton
        type="primary"
        :loading="classifyMutation.isPending.value"
        :disabled="cyclistCount === 0 && !isClassified"
        @click="handleClassifyAndAdvance"
      >
        <template #icon><NIcon :component="CheckmarkCircleOutline" /></template>
        {{ isClassified ? 'Avanzar' : 'Clasificar y avanzar' }}
      </NButton>
      <NButton v-if="hasNext && !isClassified" quaternary size="small" @click="handleSkip">
        <template #icon><NIcon :component="ArrowForwardOutline" /></template>
        Solo avanzar
      </NButton>
    </template>
  </div>
</template>

<style scoped src="./photo-actions.css" />
