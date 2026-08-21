import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import type { IEventConfigurationPresetResponse } from '../../types/responses/event-configuration.response'

export function useEventConfigurationPreset() {
  const query = useQuery({
    queryKey: EVENT_QUERY_KEYS.configurationPreset(),
    queryFn: async () => {
      const response = await httpClient.get<IEventConfigurationPresetResponse>(
        API_ROUTES.EVENTS.CONFIGURATION_PRESET,
        { silent: true },
      )
      return response.data
    },
    retry: false,
  })

  const isIncompleteProfile = computed(() => {
    if (!query.error.value) return false
    const err = query.error.value as { response?: { status?: number } }
    return err.response?.status === 422
  })

  const incompleteProfileMessage = computed(() => {
    if (!isIncompleteProfile.value) return null
    const err = query.error.value as { response?: { data?: { error?: { message?: string } } } }
    return err.response?.data?.error?.message ?? null
  })

  return {
    ...query,
    isIncompleteProfile,
    incompleteProfileMessage,
  }
}
