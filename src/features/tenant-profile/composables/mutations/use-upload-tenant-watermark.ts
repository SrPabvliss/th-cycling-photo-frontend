import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { b2UploadClient } from '@/core/http/b2-upload-client'
import { TENANT_PROFILE_QUERY_KEYS } from '../../constants/query-keys'

interface PresignedWatermarkUpload {
  url: string
  objectKey: string
  expiresIn: number
}

export function useUploadTenantWatermark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: presigned } = await httpClient.post<PresignedWatermarkUpload>(
        API_ROUTES.TENANT_PROFILE.WATERMARK_PRESIGNED_URL,
        { fileName: file.name, contentType: file.type },
      )

      await b2UploadClient.put(presigned.url, file, {
        headers: { 'Content-Type': file.type },
      })

      await httpClient.post(API_ROUTES.TENANT_PROFILE.WATERMARK_CONFIRM, {
        storageKey: presigned.objectKey,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_PROFILE_QUERY_KEYS.profile() })
    },
  })
}
