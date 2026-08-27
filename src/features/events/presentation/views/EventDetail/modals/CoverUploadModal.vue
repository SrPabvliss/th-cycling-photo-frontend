<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NIcon, NModal } from 'naive-ui'
import { AlertCircleOutline, CloudUploadOutline } from '@vicons/ionicons5'

import { useUploadAsset } from '@/features/event-assets/composables/mutations/use-upload-asset'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp'

const props = defineProps<{ show: boolean; event: IEventDetail }>()

const emit = defineEmits<{ 'update:show': [value: boolean]; done: [] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const hasCover = computed(() => props.event.coverImageSlug !== null)

const title = computed(() => (hasCover.value ? 'Reemplazar la portada' : 'Subir imagen de portada'))

const confirmLabel = computed(() => (hasCover.value ? 'Reemplazar' : 'Subir y publicar'))

const canConfirm = computed(() => selectedFile.value !== null)

const { mutateAsync: uploadAsset, isPending } = useUploadAsset(props.event.id)

function triggerFilePick() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  selectedFile.value = file ?? null
}

function resetForm() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function close() {
  resetForm()
  emit('update:show', false)
}

async function confirm() {
  if (!selectedFile.value) return
  await uploadAsset({ file: selectedFile.value, assetType: 'cover_image' })
  emit('done')
  close()
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="title"
    style="width: 480px"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <template #header-extra>{{ event.name }}</template>

    <div class="cum-body">
      <div v-if="!hasCover" class="cum-notice" data-test="cover-upload-notice">
        <NIcon :component="AlertCircleOutline" :size="16" />
        <div>
          <b>Con esta imagen el evento entra a la galería.</b>
          <span>
            Al guardarla, el evento pasa a ser visible y sus fotos se pueden comprar de inmediato.
          </span>
        </div>
      </div>

      <div class="cum-dropzone" data-test="cover-upload-dropzone" @click="triggerFilePick">
        <NIcon :component="CloudUploadOutline" :size="28" />
        <b>{{ selectedFile ? selectedFile.name : 'Arrastra la imagen o elige un archivo' }}</b>
        <span>
          JPG o PNG · horizontal · desde 1200 px de ancho. Se recorta a 16:9 para la galería.
        </span>
        <NButton size="small" data-test="cover-upload-choose" @click.stop="triggerFilePick">
          Elegir archivo
        </NButton>
      </div>

      <input
        ref="fileInput"
        type="file"
        :accept="ACCEPTED_TYPES"
        data-test="cover-upload-input"
        style="display: none"
        @change="handleFileChange"
      />

      <p v-if="hasCover" class="cum-footnote" data-test="cover-upload-footnote">
        La portada actual se reemplaza. El evento no deja de ser visible en ningún momento.
      </p>
    </div>

    <template #footer>
      <div class="cum-footer">
        <NButton @click="close">Cancelar</NButton>
        <NButton
          type="primary"
          :disabled="!canConfirm"
          :loading="isPending"
          data-test="cover-upload-confirm"
          @click="confirm"
        >
          {{ confirmLabel }}
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./cover-upload-modal.css" />
