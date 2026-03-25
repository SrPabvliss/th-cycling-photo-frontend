import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLIENT_GALLERY_QUERY_KEYS } from '../../constants/query-keys'
import { toCustomerLookup } from '../../mappers/customer-lookup.mapper'
import type {
  IApiCustomerLookup,
  ICustomerLookup,
} from '../../types/responses/customer-lookup.response'

export function useCustomerLookup(token: Ref<string>, whatsapp: Ref<string>) {
  const normalizedPhone = computed(() => whatsapp.value.replace(/\s/g, ''))
  const isValidPhone = computed(() => normalizedPhone.value.length >= 8)

  return useQuery({
    queryKey: computed(() =>
      CLIENT_GALLERY_QUERY_KEYS.customerLookup(token.value, normalizedPhone.value),
    ),
    queryFn: async (): Promise<ICustomerLookup | null> => {
      try {
        const response = await httpClient.get<IApiCustomerLookup>(
          API_ROUTES.PREVIEW_PUBLIC.CUSTOMER_LOOKUP(token.value),
          { params: { whatsapp: normalizedPhone.value }, silent: true },
        )
        return toCustomerLookup(response.data)
      } catch {
        return null
      }
    },
    enabled: computed(() => !!token.value && isValidPhone.value),
    retry: false,
  })
}
