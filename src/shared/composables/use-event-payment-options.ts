import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IEventPaymentOptions } from '@/shared/types/payment-method.types'

export function useEventPaymentOptionsQuery(eventId: Ref<string>, enabled: Ref<boolean>) {
  return useQuery({
    queryKey: computed(() => [API_ROUTES.PAYMENTS.EVENT_OPTIONS(eventId.value)] as const),
    queryFn: async () => {
      const response = await httpClient.get<IEventPaymentOptions>(
        API_ROUTES.PAYMENTS.EVENT_OPTIONS(eventId.value),
        { silent: true },
      )
      return response.data
    },
    enabled: computed(() => enabled.value && !!eventId.value),
  })
}
