import { ref } from 'vue'
import { useMessage } from 'naive-ui'

import { usePhotoDownloadUrl } from '@/features/_legacy/classifications/composables/queries/use-photo-download-url'
import { useUploadRetouched } from '@/features/retouch/composables/mutations/use-upload-retouched'

/** Photo download (presigned URL → anchor) + upload retouched (PUT → confirm). */
export function usePhotoFileOps() {
  const message = useMessage()
  const { getDownloadUrl } = usePhotoDownloadUrl()
  const uploadRetouched = useUploadRetouched()
  const fileInput = ref<HTMLInputElement>()
  const isDownloading = ref(false)

  async function download(photoId: string, filename: string) {
    isDownloading.value = true
    try {
      const url = await getDownloadUrl(photoId)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.target = '_blank'
      anchor.rel = 'noopener noreferrer'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    } finally {
      isDownloading.value = false
    }
  }

  function triggerUpload() {
    fileInput.value?.click()
  }

  function handleFileSelected(event: Event, photoId: string, onSuccess: () => void) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    uploadRetouched.mutate(
      { photoId, file },
      {
        onSuccess: () => {
          onSuccess()
          message.success('Imagen retocada subida correctamente')
        },
        onSettled: () => {
          input.value = ''
        },
      },
    )
  }

  return {
    fileInput,
    isDownloading,
    isUploading: uploadRetouched.isPending,
    download,
    triggerUpload,
    handleFileSelected,
  }
}
