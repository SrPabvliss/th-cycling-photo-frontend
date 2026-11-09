import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiAvatarPresignedUrl } from '../../types/responses/avatar-presigned-url.response'

interface AvatarPresignedUrlParams {
  fileName: string
  contentType: string
}

export function useAvatarPresignedUrl() {
  return useMutation({
    mutationFn: async ({ fileName, contentType }: AvatarPresignedUrlParams) => {
      const response = await httpClient.post<IApiAvatarPresignedUrl>(
        API_ROUTES.MY_PROFILE.AVATAR_PRESIGNED_URL,
        { fileName, contentType },
      )
      return response.data
    },
  })
}
