<script setup lang="ts">
import { NButton, NFlex, NIcon } from 'naive-ui'
import { CheckmarkDoneOutline, EyeOutline } from '@vicons/ionicons5'

import { usePhotoSelectionStore } from '@/features/preview-links/stores/photo-selection.store'

const selectionStore = usePhotoSelectionStore()

const emit = defineEmits<{
  generatePreview: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="selectionStore.hasSelection" class="floating-bar">
        <NFlex :size="16" align="center" justify="center">
          <NIcon :component="CheckmarkDoneOutline" :size="20" />
          <span>
            {{ selectionStore.selectedCount }} foto{{
              selectionStore.selectedCount !== 1 ? 's' : ''
            }}
            seleccionada{{ selectionStore.selectedCount !== 1 ? 's' : '' }}
          </span>
          <NButton type="primary" @click="emit('generatePreview')">
            <template #icon><NIcon :component="EyeOutline" /></template>
            Generar Preview
          </NButton>
          <NButton @click="selectionStore.clear()">Deseleccionar todo</NButton>
        </NFlex>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped src="./photo-selection-bar.css" />
