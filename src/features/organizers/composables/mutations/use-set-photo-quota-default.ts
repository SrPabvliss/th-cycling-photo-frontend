import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORGANIZER_QUERY_KEYS } from '../../constants/query-keys'
import type { ISetPhotoQuotaDefaultPayload } from '../../types/requests/set-photo-quota-default.request'

export function useSetPhotoQuotaDefault() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, photoQuota }: ISetPhotoQuotaDefaultPayload) => {
      await httpClient.patch(API_ROUTES.TENANTS.PHOTO_QUOTA_DEFAULT(id), { photoQuota })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ORGANIZER_QUERY_KEYS.detail(variables.id) })
    },
  })
}
