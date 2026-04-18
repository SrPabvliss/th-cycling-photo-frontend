import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '@/features/events/constants/query-keys'
import { PHOTO_QUERY_KEYS } from '../../constants/query-keys'
import type { IApiUploadedPhoto } from '../../types/responses/upload-photo.response'

export function useUploadPhotos() {
  const queryClient = useQueryClient()
  const uploadProgress = ref(0)

  const mutation = useMutation({
    mutationFn: async ({ eventId, files }: { eventId: string; files: File[] }) => {
      uploadProgress.value = 0
      const formData = new FormData()
      for (const file of files) {
        formData.append('photos', file)
      }

      const response = await httpClient.post<IApiUploadedPhoto[]>(
        API_ROUTES.PHOTOS.UPLOAD(eventId),
        formData,
        {
          onUploadProgress: (e) => {
            if (e.total) {
              uploadProgress.value = Math.round((e.loaded / e.total) * 100)
            }
          },
        },
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.all() })
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })

  return { ...mutation, uploadProgress }
}
