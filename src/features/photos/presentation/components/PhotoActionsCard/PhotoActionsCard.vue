<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { ArrowUpOutline, SnowOutline, TrashOutline } from '@vicons/ionicons5'
import { formatFileSize } from '@/shared/utils/format.utils'

const props = defineProps<{
  fileSize: number
  frozen: boolean
}>()

defineEmits<{
  download: []
  delete: []
}>()
</script>

<template>
  <section class="pd-card">
    <div class="pd-card-h">
      <h4>Acciones</h4>
    </div>
    <div class="pd-acts">
      <button
        type="button"
        class="tt-btn tt-btn-ghost"
        data-test="actions-download"
        @click="$emit('download')"
      >
        <NIcon :component="ArrowUpOutline" :size="14" style="transform: rotate(180deg)" />
        Descargar el original · {{ formatFileSize(props.fileSize) }}
      </button>
      <span v-if="frozen" class="dt-blocked" data-test="actions-frozen">
        <NIcon :component="SnowOutline" :size="13" />
        El evento está congelado: no se puede borrar
      </span>
      <button
        v-else
        type="button"
        class="tt-btn tt-btn-ghost danger"
        data-test="actions-delete"
        @click="$emit('delete')"
      >
        <NIcon :component="TrashOutline" :size="13" />
        Eliminar la foto
      </button>
    </div>
  </section>
</template>

<style scoped src="./photo-actions-card.css" />
