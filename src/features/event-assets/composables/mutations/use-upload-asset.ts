import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { b2UploadClient } from '@/core/http/b2-upload-client'
import { EVENT_ASSET_QUERY_KEYS } from '../../constants/query-keys'
import { EVENT_QUERY_KEYS } from '@/features/events/constants/query-keys'
import type { EventAssetType } from '../../types/asset-type'
import type { IApiAssetPresignedUrl } from '../../types/responses/asset-presigned-url.response'

interface UploadAssetParams {
  file: File
  assetType: EventAssetType
}

export function useUploadAsset(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, assetType }: UploadAssetParams) => {
      const { data: presigned } = await httpClient.post<IApiAssetPresignedUrl>(
        API_ROUTES.EVENTS.ASSETS.PRESIGNED_URL(eventId, assetType),
        { fileName: file.name, contentType: file.type },
      )

      await b2UploadClient.put(presigned.url, file, {
        headers: { 'Content-Type': file.type },
      })

      await httpClient.post(API_ROUTES.EVENTS.ASSETS.CONFIRM(eventId, assetType), {
        storageKey: presigned.objectKey,
        fileSize: file.size,
        mimeType: file.type,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_ASSET_QUERY_KEYS.byEvent(eventId) })
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })
}
