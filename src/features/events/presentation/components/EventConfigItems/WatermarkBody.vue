<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { AlertCircleOutline, ImageOutline } from '@vicons/ionicons5'

import { usePresignAndUploadWatermark } from '@/features/tenant-profile/composables/mutations/use-presign-and-upload-watermark'
import { validateWatermarkFile } from '@/features/tenant-profile/utils/watermark-file.utils'
import type { IWatermarkDraft } from '../../../composables/use-configuration-items'
import SaveToProfileCheck from './SaveToProfileCheck.vue'
import SourceChoice from './SourceChoice.vue'

const props = withDefaults(
  defineProps<{
    hasProfileValue: boolean
    profileLabel: string
    useProfile: boolean
    saveToProfile: boolean
    showSaveToProfile?: boolean
    draft: IWatermarkDraft
    currentUrl?: string | null
  }>(),
  { showSaveToProfile: true, currentUrl: null },
)

const emit = defineEmits<{
  'update:use-profile': [boolean]
  'update:save-to-profile': [boolean]
  'update:draft': [Partial<IWatermarkDraft>]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const validationError = ref<string | null>(null)
const previewUrl = ref<string | null>(null)

function releasePreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
}

onBeforeUnmount(releasePreview)

const shownImage = computed(() => previewUrl.value ?? props.currentUrl)
const { mutate: presignAndUpload, isPending, isError } = usePresignAndUploadWatermark()

function pickFile() {
  fileInput.value?.click()
}

async function onFileChosen(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const problem = await validateWatermarkFile(file)
  if (problem) {
    validationError.value = problem
    input.value = ''
    return
  }
  validationError.value = null
  releasePreview()
  previewUrl.value = URL.createObjectURL(file)

  presignAndUpload(file, {
    onSuccess: (storageKey) => emit('update:draft', { storageKey, fileName: file.name }),
  })
  input.value = ''
}
</script>

<template>
  <SourceChoice
    v-if="hasProfileValue"
    :profile-label="profileLabel"
    :use-profile="useProfile"
    @update:use-profile="emit('update:use-profile', $event)"
  />

  <template v-if="!useProfile">
    <div class="ce-upload" data-test="watermark-upload">
      <div class="ce-upl-prev" :class="{ ok: draft.storageKey !== null }">
        <img v-if="shownImage" :src="shownImage" alt="Marca de agua del evento" />
        <NIcon v-else :component="ImageOutline" :size="22" />
      </div>
      <div class="ce-upl-t">
        <b>{{ draft.fileName ?? 'Sube la marca de agua' }}</b>
        <span>PNG con fondo transparente, entre 200 y 4000 px de ancho, máximo 2 MB.</span>
      </div>
      <NButton :loading="isPending" data-test="watermark-pick" @click="pickFile">
        Elegir imagen
      </NButton>
      <input
        ref="fileInput"
        class="ce-upl-file"
        type="file"
        accept="image/png"
        data-test="watermark-file"
        @change="onFileChosen"
      />
    </div>

    <span v-if="validationError" class="ce-fhint err" data-test="watermark-invalid">
      <NIcon :component="AlertCircleOutline" :size="13" />
      {{ validationError }}
    </span>

    <span v-else-if="isError" class="ce-fhint err" data-test="watermark-error">
      <NIcon :component="AlertCircleOutline" :size="13" />
      No pudimos subir la marca de agua. Intenta de nuevo.
    </span>

    <SaveToProfileCheck
      v-if="showSaveToProfile"
      :model-value="saveToProfile"
      :has-profile-value="hasProfileValue"
      @update:model-value="emit('update:save-to-profile', $event)"
    />

    <p v-if="hasProfileValue && saveToProfile" class="ce-frozen" data-test="watermark-replace-note">
      <NIcon :component="AlertCircleOutline" :size="14" />
      Tu perfil guarda una sola marca de agua: si la guardas en el perfil, reemplaza la actual.
    </p>
  </template>
</template>

<style scoped src="./watermark-body.css" />
