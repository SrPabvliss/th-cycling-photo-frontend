import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import { toParticipantListItems } from '../../mappers/cyclist-list.mapper'
import type { IApiParticipantListItem } from '../../types/responses/cyclist-list.response'

export function usePhotoParticipantsQuery(photoId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => CLASSIFICATION_QUERY_KEYS.participantsByPhoto(photoId.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiParticipantListItem[]>(
        API_ROUTES.CLASSIFICATIONS.PARTICIPANTS_BY_PHOTO(photoId.value),
      )
      return toParticipantListItems(response.data)
    },
    enabled: computed(() => !!photoId.value),
  })
}
