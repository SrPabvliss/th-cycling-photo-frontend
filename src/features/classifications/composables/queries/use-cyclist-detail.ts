import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import { toParticipantDetail } from '../../mappers/cyclist-detail.mapper'
import type { IApiParticipantDetail } from '../../types/responses/cyclist-detail.response'

export function useParticipantDetailQuery(participantId: Ref<string | null>) {
  return useQuery({
    queryKey: computed(() => CLASSIFICATION_QUERY_KEYS.participantDetail(participantId.value!)),
    queryFn: async () => {
      const response = await httpClient.get<IApiParticipantDetail>(
        API_ROUTES.CLASSIFICATIONS.PARTICIPANT_DETAIL(participantId.value!),
      )
      return toParticipantDetail(response.data)
    },
    enabled: computed(() => !!participantId.value),
  })
}
