import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import type { IEventConfigurationResponse } from '../../types/responses/event-configuration.response'

export function useEventConfiguration(eventId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => EVENT_QUERY_KEYS.configuration(eventId.value)),
    queryFn: async () => {
      const response = await httpClient.get<IEventConfigurationResponse>(
        API_ROUTES.EVENTS.CONFIGURATION(eventId.value),
      )
      return response.data
    },
    enabled: computed(() => !!eventId.value),
  })
}
