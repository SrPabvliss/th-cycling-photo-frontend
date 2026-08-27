import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { b2UploadClient } from '@/core/http/b2-upload-client'

interface IPresignedWatermarkUpload {
  url: string
  objectKey: string
  expiresIn: number
}

export function usePresignAndUploadWatermark() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const { data: presigned } = await httpClient.post<IPresignedWatermarkUpload>(
        API_ROUTES.TENANT_PROFILE.WATERMARK_PRESIGNED_URL,
        { fileName: file.name, contentType: file.type },
      )

      await b2UploadClient.put(presigned.url, file, {
        headers: { 'Content-Type': file.type },
      })

      return presigned.objectKey
    },
  })
}
