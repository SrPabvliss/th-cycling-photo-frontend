import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_ASSET_QUERY_KEYS } from '../../constants/query-keys'
import type { EventAssetType } from '../../types/asset-type'

interface ISetFocalPointParams {
  assetType: EventAssetType
  focalX: number
  focalY: number
}

export function useSetAssetFocalPoint(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ assetType, focalX, focalY }: ISetFocalPointParams) => {
      await httpClient.patch(API_ROUTES.EVENTS.ASSETS.FOCAL_POINT(eventId, assetType), {
        focalX,
        focalY,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_ASSET_QUERY_KEYS.byEvent(eventId) })
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.EVENTS.BASE] })
    },
  })
}
