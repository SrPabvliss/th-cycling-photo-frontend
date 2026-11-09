<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NCard, NFormItem, NInput, NUpload, useMessage } from 'naive-ui'
import type { UploadCustomRequestOptions, UploadInst } from 'naive-ui'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useUpdateTenantProfile } from '../../composables/mutations/use-update-tenant-profile'
import { useUploadTenantWatermark } from '../../composables/mutations/use-upload-tenant-watermark'
import { validateWatermarkFile } from '../../utils/watermark-file.utils'
import type { TenantProfileResponse } from '../../types/responses/tenant-profile.response'

const props = defineProps<{ profile: TenantProfileResponse }>()

const { has } = usePermissions()
const canEditProfile = computed(() => has(PERMISSIONS.TENANT_PROFILE_UPDATE))

const publicName = ref(props.profile.publicName ?? '')

watch(
  () => props.profile.publicName,
  (serverPublicName) => {
    publicName.value = serverPublicName ?? ''
  },
)

const hasChanges = computed(() => publicName.value !== (props.profile.publicName ?? ''))

const { mutate, isPending } = useUpdateTenantProfile()
const { mutateAsync: uploadWatermark, isPending: isUploading } = useUploadTenantWatermark()
const message = useMessage()
const uploadRef = ref<UploadInst | null>(null)

function submit() {
  if (!hasChanges.value) return
  const trimmed = publicName.value.trim()
  mutate(
    { publicName: trimmed === '' ? null : trimmed },
    { onSuccess: () => message.success('Nombre público actualizado') },
  )
}

async function handleUpload({ file, onFinish, onError }: UploadCustomRequestOptions) {
  try {
    if (!file.file) return onError()

    const problem = await validateWatermarkFile(file.file)
    if (problem) {
      message.error(problem)
      return onError()
    }

    await uploadWatermark(file.file)
    message.success('Marca de agua actualizada')
    onFinish()
  } catch {
    message.error('No se pudo subir la marca de agua')
    onError()
  } finally {
    uploadRef.value?.clear()
  }
}
</script>

<template>
  <NCard title="Marca" class="brand-section">
    <NFormItem label="Nombre público">
      <NInput v-model:value="publicName" :disabled="!canEditProfile" placeholder="Nombre público" />
    </NFormItem>

    <NFormItem label="Marca de agua">
      <div class="watermark">
        <img v-if="profile.watermarkUrl" :src="profile.watermarkUrl" alt="Marca de agua actual" />
        <p v-else class="watermark__empty">Aún no has subido una marca de agua.</p>

        <NUpload
          v-if="canEditProfile"
          ref="uploadRef"
          accept="image/png"
          :show-file-list="false"
          :disabled="isUploading"
          :custom-request="handleUpload"
        >
          <NButton :loading="isUploading">Subir marca de agua (PNG)</NButton>
        </NUpload>

        <p class="watermark__hint">
          PNG con fondo transparente, entre 200 y 4000 px de ancho, máximo 2 MB. Se dibuja en
          mosaico sobre las fotos de la galería pública de tus próximos eventos.
        </p>
      </div>
    </NFormItem>

    <NButton
      v-if="canEditProfile"
      type="primary"
      :disabled="!hasChanges"
      :loading="isPending"
      @click="submit"
    >
      Guardar cambios
    </NButton>
  </NCard>
</template>

<style scoped>
.watermark {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.watermark img {
  max-width: 240px;
  max-height: 120px;
  object-fit: contain;
}

.watermark__empty,
.watermark__hint {
  margin: 0;
  font-size: 13px;
  opacity: 0.7;
}
</style>
