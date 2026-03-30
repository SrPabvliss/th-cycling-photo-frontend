import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiPhotoCategory } from '../../types/responses/photo-category.response'
import { toPhotoCategory } from '../../mappers/photo-category.mapper'

export const PHOTO_CATEGORIES_GLOBAL_KEY = ['photo-categories-global'] as const

export function usePhotoCategoriesGlobalQuery() {
  return useQuery({
    queryKey: PHOTO_CATEGORIES_GLOBAL_KEY,
    queryFn: async () => {
      const { data } = await httpClient.get<IApiPhotoCategory[]>(
        API_ROUTES.PHOTO_CATEGORIES.GET_ALL,
      )
      return data.map(toPhotoCategory)
    },
  })
}
