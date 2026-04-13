import { useQuery } from '@tanstack/vue-query'
import { watch } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CART_QUERY_KEYS } from '../../constants/query-keys'
import { useCartStore } from '../../stores/cart.store'
import type { IApiCartGroup, ICartGroup } from '../../types/responses/cart.response'

function toCartGroup(api: IApiCartGroup): ICartGroup {
  return {
    eventId: api.eventId,
    eventName: api.eventName,
    eventDate: new Date(api.eventDate),
    coverUrl: api.coverUrl,
    coverSlug: api.coverSlug,
    photos: api.photos,
  }
}

export function useCartQuery() {
  const cartStore = useCartStore()

  const query = useQuery({
    queryKey: CART_QUERY_KEYS.cart(),
    queryFn: async () => {
      const { data } = await httpClient.get<IApiCartGroup[]>(API_ROUTES.CART.GET, {
        params: { sessionId: cartStore.sessionId },
        silent: true,
      })
      return data.map(toCartGroup)
    },
  })

  watch(query.data, (groups) => {
    if (groups) cartStore.setGroups(groups)
  })

  return query
}
