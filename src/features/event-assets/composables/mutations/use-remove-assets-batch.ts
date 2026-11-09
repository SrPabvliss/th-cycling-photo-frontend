import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_ASSET_QUERY_KEYS } from '../../constants/query-keys'
import type { EventAssetType } from '../../types/asset-type'

interface RemoveAssetsBatchParams {
  eventId: string
  assetTypes: EventAssetType[]
}

export function useRemoveAssetsBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, assetTypes }: RemoveAssetsBatchParams) => {
      await Promise.all(
        assetTypes.map((assetType) =>
          httpClient.delete(API_ROUTES.EVENTS.ASSETS.DELETE(eventId, assetType)),
        ),
      )
      return eventId
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: EVENT_ASSET_QUERY_KEYS.byEvent(eventId) })
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.EVENTS.BASE] })
    },
  })
}
