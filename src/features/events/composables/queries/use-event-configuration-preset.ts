import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import type { IEventConfigurationPresetResponse } from '../../types/responses/event-configuration.response'

export function useEventConfigurationPreset() {
  return useQuery({
    queryKey: EVENT_QUERY_KEYS.configurationPreset(),
    queryFn: async () => {
      const response = await httpClient.get<IEventConfigurationPresetResponse>(
        API_ROUTES.EVENTS.CONFIGURATION_PRESET,
      )
      return response.data
    },
  })
}
