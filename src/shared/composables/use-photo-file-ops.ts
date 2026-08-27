import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'

export function usePhotoFileOps() {
  const message = useMessage()
  const queryClient = useQueryClient()
  const fileInput = ref<HTMLInputElement>()
  const isDownloading = ref(false)

  const uploadRetouched = useMutation({
    mutationFn: async ({ photoId, file }: { photoId: string; file: File }) => {
      const presignedRes = await httpClient.post<{ url: string; key: string }>(
        API_ROUTES.PHOTOS.RETOUCHED_PRESIGNED_URL(photoId),
        { contentType: file.type, fileSize: file.size },
      )
      await fetch(presignedRes.data.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      await httpClient.post(API_ROUTES.PHOTOS.RETOUCHED_CONFIRM(photoId), {
        key: presignedRes.data.key,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PHOTOS.BASE] })
    },
  })

  async function download(photoId: string, filename: string) {
    isDownloading.value = true
    try {
      const response = await httpClient.get<{ url: string }>(API_ROUTES.PHOTOS.DOWNLOAD(photoId), {
        params: { type: 'original' },
      })
      const url = response.data.url
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
