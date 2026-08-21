<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NCard, NFormItem, NInput, NUpload, useMessage } from 'naive-ui'
import type { UploadCustomRequestOptions } from 'naive-ui'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useUpdateTenantProfile } from '../../composables/mutations/use-update-tenant-profile'
import { useUploadTenantWatermark } from '../../composables/mutations/use-upload-tenant-watermark'
import type { TenantProfileResponse } from '../../types/responses/tenant-profile.response'

const props = defineProps<{ profile: TenantProfileResponse }>()

const { has } = usePermissions()
const canEditProfile = computed(() => has(PERMISSIONS.TENANT_PROFILE_UPDATE))

const publicName = ref(props.profile.publicName ?? '')

watch(
  () => props.profile,
  (profile) => {
    publicName.value = profile.publicName ?? ''
  },
)

const hasChanges = computed(() => publicName.value !== (props.profile.publicName ?? ''))

const { mutate, isPending } = useUpdateTenantProfile()
const { mutateAsync: uploadWatermark, isPending: isUploading } = useUploadTenantWatermark()
const message = useMessage()

function submit() {
  if (!hasChanges.value) return
  const trimmed = publicName.value.trim()
  mutate({ publicName: trimmed === '' ? null : trimmed })
}

async function handleUpload({ file, onFinish, onError }: UploadCustomRequestOptions) {
  if (!file.file) return onError()
  try {
    await uploadWatermark(file.file)
    message.success('Marca de agua actualizada')
    onFinish()
  } catch {
    message.error('No se pudo subir la marca de agua')
    onError()
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
          accept="image/png"
          :max="1"
          :show-file-list="false"
          :disabled="isUploading"
          :custom-request="handleUpload"
        >
          <NButton :loading="isUploading">Subir marca de agua (PNG)</NButton>
        </NUpload>

        <p class="watermark__hint">
          Usa un PNG con fondo transparente. Se aplicará sobre las fotos de la galería pública de
          tus próximos eventos.
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
