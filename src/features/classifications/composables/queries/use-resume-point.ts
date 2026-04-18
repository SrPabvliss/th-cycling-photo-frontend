import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiResumePoint } from '../../types/responses/resume-point.response'

const WORKSPACE_LIMIT = 50

export function useResumePointQuery(eventId: Ref<string>, enabled: Ref<boolean>) {
  return useQuery({
    queryKey: computed(() => ['resume-point', eventId.value] as const),
    queryFn: async () => {
      const response = await httpClient.get<IApiResumePoint>(
        API_ROUTES.PHOTOS.RESUME_POINT(eventId.value),
        { params: { limit: WORKSPACE_LIMIT } },
      )
      return response.data
    },
    enabled: computed(() => !!eventId.value && enabled.value),
    staleTime: 0,
  })
}
