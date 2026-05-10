import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import { REVIEW_QUERY_KEYS } from '../../constants/query-keys'
import type { IAddPhotoColorRequest } from '../../types/requests/add-photo-color.request'
import type { IAddPhotoColorResponse } from '../../types/responses/add-photo-color.response'

export function useAddPhotoColor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: IAddPhotoColorRequest) => {
      const { data } = await httpClient.post<IAddPhotoColorResponse>(
        API_ROUTES.PHOTOS.ADD_COLOR(input.photoId),
        {
          region: input.region,
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor ?? null,
        },
      )
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: PHOTO_QUERY_KEYS.detailBySlug(variables.photoSlug),
      })
      queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.all() })
      queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.all() })
    },
  })
}
