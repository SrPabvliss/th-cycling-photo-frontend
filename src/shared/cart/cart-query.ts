import { useQuery, type QueryClient } from '@tanstack/vue-query'
import { effectScope, ref, watch, type Ref } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { useSessionStore } from '@/core/auth/stores/session.store'
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

const followingSession = new WeakSet<QueryClient>()
const CART_KEY_HASH = JSON.stringify(CART_QUERY_KEYS.cart())

/**
 * Keeps track of whether the cart was read, and of whose cart it is. Signing in or out changes
 * whose cart this is. When the session goes (signed out, or expired
 * and the refresh failed) the account cart is dropped, not shown as the anonymous one, and the
 * cart is read again; until then it counts as not loaded. A refreshed token keeps the session and
 * changes nothing. Done once per query client, outside any component, so it outlives screens.
 */
function followServer(queryClient: QueryClient, answered: Ref<boolean>) {
  if (followingSession.has(queryClient)) return
  followingSession.add(queryClient)

  // The server answered once the answer is in the cache, not when the request returned: in
  // between, the cart would count as read with nothing in it. Writes of the optimistic changes
  // are marked manual and do not count.
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated' || event.query.queryHash !== CART_KEY_HASH) return
    if (event.action.type === 'success' && !event.action.manual) answered.value = true
  })

  const session = useSessionStore()
  effectScope(true).run(() =>
    watch(
      () => !!session.accessToken,
      () => {
        answered.value = false
        void queryClient.resetQueries({ queryKey: CART_QUERY_KEYS.cart() })
      },
      // At once: an answer of the old session still on its way must not land after this.
      { flush: 'sync' },
    ),
  )
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
  followServer(queryClient, hasServerAnswered(queryClient))

  return useQuery({
    queryKey: CART_QUERY_KEYS.cart(),
    queryFn: () => fetchCart(cartStore.sessionId),
  })
}
