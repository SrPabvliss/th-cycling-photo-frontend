import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '../../constants/query-keys'

export function useClassificationFailuresQuery(eventId: Ref<string>, enabled: Ref<boolean>) {
  return useQuery({
    queryKey: computed(() => PHOTO_QUERY_KEYS.classificationFailures(eventId.value)),
    queryFn: async () => {
      const response = await httpClient.get<{ failedCount: number }>(
        API_ROUTES.PHOTOS.CLASSIFICATION_FAILURES(eventId.value),
      )
      return response.data.failedCount
    },
    enabled: computed(() => Boolean(eventId.value) && enabled.value),
  })
}
