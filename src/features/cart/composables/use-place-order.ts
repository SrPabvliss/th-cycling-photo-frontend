import { useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { readonly, ref, type Ref } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CONSENT_TYPE } from '@/features/auth/constants/consent.constants'
import { ACCOUNT_QUERY_KEYS } from '@/features/account/constants/query-keys'
import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { useCartStore } from '@/shared/stores/cart.store'
import type { ICheckoutOrderResult } from '@/shared/types/cart.types'
import { checkoutProblem, type CheckoutProblem } from '@/shared/utils/checkout-error'
import type { PaymentMethod } from '@/shared/types/payment-method.types'

const isServerFailure = (error: unknown) =>
  isAxiosError(error) && (error.response?.status ?? 0) >= 500

export interface IPlaceOrderInput {
  eventId: string
  method: PaymentMethod
  billingAccountId: string
  /** The buyer ticked the electronic invoice consent: record it before ordering. */
  recordConsent?: boolean
}

export type IPlacedOrder = ICheckoutOrderResult

export interface IPlaceOrder {
  /** Creates the order of one event. Null when it could not, with `problem` saying why. */
  place(input: IPlaceOrderInput): Promise<IPlacedOrder[] | null>
  isPlacing: Readonly<Ref<boolean>>
  problem: Readonly<Ref<CheckoutProblem | null>>
  reset(): void
}

/**
 * Creates the order of one event, once. While it is on its way any other call gets the same
 * answer and sends nothing: a double tap or a repeated Enter cannot create two orders. Silent:
 * the screen shows the problem next to the button.
 *
 * A transfer order takes the photos out of the cart. A card order is only a draft until it is
 * paid, so the cart is left as it is.
 */
export function usePlaceOrder(): IPlaceOrder {
  const queryClient = useQueryClient()
  const cartStore = useCartStore()

  const isPlacing = ref(false)
  const problem = ref<CheckoutProblem | null>(null)
  let pending: Promise<IPlacedOrder[] | null> | null = null

  async function run(input: IPlaceOrderInput): Promise<IPlacedOrder[] | null> {
    problem.value = null

    try {
      // An anonymous cart the buyer filled before signing in becomes the account's. The server
      // answers fine when there is nothing to merge, so a failure here is a real one: ordering
      // anyway would leave those photos out and read as "not in your cart". Stop, nothing is lost.
      await httpClient.post(
        API_ROUTES.CART.MERGE,
        { sessionId: cartStore.sessionId },
        { silent: true },
      )
    } catch (error) {
      const failed = checkoutProblem(error)
      problem.value = failed === 'unknown' && isServerFailure(error) ? 'network' : failed
      return null
    }

    // Set once the order request itself left: only its lost answer leaves the order unknown.
    let orderAsked = false
    try {
      if (input.recordConsent) {
        await httpClient.post(
          API_ROUTES.AUTH.CONSENTS,
          { types: [CONSENT_TYPE.ELECTRONIC_INVOICE] },
          { silent: true },
        )
        void queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.billingAccounts() })
      }

      orderAsked = true
      const response = await httpClient.post<{ orders: IPlacedOrder[] }>(
        API_ROUTES.CART.CHECKOUT,
        {
          items: [{ eventId: input.eventId }],
          method: input.method,
          billingAccountId: input.billingAccountId,
        },
        { silent: true },
      )

      if (input.method === 'transfer') {
        void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
        void queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.orders() })
      }
      return response.data.orders
    } catch (error) {
      const failed = checkoutProblem(error)
      // No answer to the order itself: it may exist. Say so instead of "nothing was lost".
      problem.value = orderAsked && failed === 'network' ? 'unconfirmed' : failed
      // Whatever the server did, the cart and the orders on screen may be out of date now (an
      // order created anyway, the photos ordered in another tab): read them again.
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
      void queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.orders() })
      return null
    }
  }

  function place(input: IPlaceOrderInput) {
    if (pending) return pending

    isPlacing.value = true
    pending = run(input).finally(() => {
      isPlacing.value = false
      pending = null
    })
    return pending
  }

  return {
    place,
    isPlacing: readonly(isPlacing),
    problem: readonly(problem),
    reset: () => {
      problem.value = null
    },
  }
}
