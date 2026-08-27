<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { AlertCircleOutline, ImageOutline } from '@vicons/ionicons5'

import { usePresignAndUploadWatermark } from '@/features/tenant-profile/composables/mutations/use-presign-and-upload-watermark'
import type { IWatermarkDraft } from '../../../composables/use-configuration-items'
import SaveToProfileCheck from './SaveToProfileCheck.vue'
import SourceChoice from './SourceChoice.vue'

withDefaults(
  defineProps<{
    hasProfileValue: boolean
    profileLabel: string
    useProfile: boolean
    saveToProfile: boolean
    showSaveToProfile?: boolean
    draft: IWatermarkDraft
  }>(),
  { showSaveToProfile: true },
)

const emit = defineEmits<{
  'update:use-profile': [boolean]
  'update:save-to-profile': [boolean]
  'update:draft': [Partial<IWatermarkDraft>]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const { mutate: presignAndUpload, isPending, isError } = usePresignAndUploadWatermark()

function pickFile() {
  fileInput.value?.click()
}

function onFileChosen(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
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
        <NIcon :component="ImageOutline" :size="22" />
      </div>
      <div class="ce-upl-t">
        <b>{{ draft.fileName ?? 'Sube la marca de agua' }}</b>
        <span>PNG con fondo transparente. Se superpone en cada foto sin comprar.</span>
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

    <span v-if="isError" class="ce-fhint err" data-test="watermark-error">
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
