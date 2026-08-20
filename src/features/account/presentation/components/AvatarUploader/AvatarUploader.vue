<script setup lang="ts">
import { computed, ref } from 'vue'
import { NAvatar, NSpin, NUpload, useMessage } from 'naive-ui'
import type { UploadCustomRequestOptions, UploadSettledFileInfo } from 'naive-ui'

import { b2UploadClient } from '@/core/http/b2-upload-client'
import { useAvatarPresignedUrl } from '../../../composables/mutations/use-avatar-presigned-url'
import { useConfirmAvatar } from '../../../composables/mutations/use-confirm-avatar'
import type { IMyProfile } from '../../../types/responses/my-profile.response'

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const props = defineProps<{
  profile: IMyProfile
}>()

const message = useMessage()
const requestPresignedUrl = useAvatarPresignedUrl()
const confirmAvatar = useConfirmAvatar()

const isUploading = ref(false)

const initials = computed(() => {
  const first = props.profile.firstName?.charAt(0) ?? ''
  const last = props.profile.lastName?.charAt(0) ?? ''
  return (first + last).toUpperCase() || props.profile.email.charAt(0).toUpperCase()
})

function beforeUpload({ file }: { file: UploadSettledFileInfo }): boolean {
  const contentType = file.file?.type ?? ''
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    message.error('Solo se permiten imágenes JPEG, PNG o WebP')
    return false
  }
  return true
}

async function customRequest({ file, onFinish, onError }: UploadCustomRequestOptions) {
  const nativeFile = file.file
  if (!nativeFile) {
    onError()
    return
  }

  isUploading.value = true

  try {
    const presigned = await requestPresignedUrl.mutateAsync({
      fileName: nativeFile.name,
      contentType: nativeFile.type,
    })

    await b2UploadClient.put(presigned.url, nativeFile, {
      headers: { 'Content-Type': nativeFile.type },
    })

    await confirmAvatar.mutateAsync(presigned.objectKey)

    message.success('Foto de perfil actualizada')
    onFinish()
  } catch {
    message.error('No pudimos actualizar tu foto de perfil')
    onError()
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="avatar-uploader">
    <NUpload
      :show-file-list="false"
      :accept="ALLOWED_CONTENT_TYPES.join(',')"
      :before-upload="beforeUpload"
      :custom-request="customRequest"
    >
      <NSpin :show="isUploading" class="avatar-uploader__spin">
        <NAvatar
          :size="96"
          round
          :src="profile.avatarUrl || undefined"
          class="avatar-uploader__avatar"
        >
          {{ initials }}
        </NAvatar>
      </NSpin>
    </NUpload>
  </div>
</template>

<style scoped src="./avatar-uploader.css"></style>
