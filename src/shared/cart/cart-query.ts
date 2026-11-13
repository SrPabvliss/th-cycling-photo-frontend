import { useQuery, type QueryClient } from '@tanstack/vue-query'
import { ref, type Ref } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { useCartStore } from '@/shared/stores/cart.store'
import type { ICartGroup } from '@/shared/types/cart.types'
import { parseDateOnly } from '@/shared/utils/date.utils'

interface IApiCartGroup {
  eventId: string
  eventName: string
  eventSlug: string
  startDate: string
  endDate: string
  photos: { id: string; publicSlug: string }[]
}

function toCartGroup(api: IApiCartGroup): ICartGroup {
  return {
    eventId: api.eventId,
    eventName: api.eventName,
    eventSlug: api.eventSlug,
    startDate: parseDateOnly(api.startDate),
    endDate: parseDateOnly(api.endDate),
    photos: api.photos.map((photo) => ({ id: photo.id, publicSlug: photo.publicSlug })),
  }
}

// Whether the server has ever answered with the cart, per query client. An optimistic change
// writes to the cache too, so "there is data" does not mean "the cart was loaded".
const serverAnswered = new WeakMap<QueryClient, Ref<boolean>>()

export function hasServerAnswered(queryClient: QueryClient): Ref<boolean> {
  let flag = serverAnswered.get(queryClient)
  if (!flag) {
    flag = ref(false)
    serverAnswered.set(queryClient, flag)
  }
  return flag
}

export async function fetchCart(sessionId: string): Promise<ICartGroup[]> {
  const { data } = await httpClient.get<IApiCartGroup[]>(API_ROUTES.CART.GET, {
    params: { sessionId },
    silent: true,
  })
  return data.map(toCartGroup)
}

/**
 * The cart of this visitor: the one of the account when signed in, the one of the anonymous
 * session otherwise. Silent: whoever shows the cart shows its error, there is no toast.
 */
export function useCartQuery(queryClient: QueryClient) {
  const cartStore = useCartStore()
  const answered = hasServerAnswered(queryClient)

  return useQuery({
    queryKey: CART_QUERY_KEYS.cart(),
    queryFn: async () => {
      const groups = await fetchCart(cartStore.sessionId)
      answered.value = true
      return groups
    },
  })
}
