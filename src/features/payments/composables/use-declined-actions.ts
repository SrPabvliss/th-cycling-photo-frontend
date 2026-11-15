import { useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { readonly, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { ACCOUNT_QUERY_KEYS } from '@/features/account/constants/query-keys'
import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { PAYMENT_METHOD } from '@/shared/types/payment-method.types'
import { checkoutProblem, type CheckoutProblem } from '@/shared/utils/checkout-error'

export interface IDeclinedActions {
  /** Turns the card orders into transfer orders and opens the received order. */
  payByTransfer(): Promise<void>
  isSwitching: Readonly<Ref<boolean>>
  problem: Readonly<Ref<CheckoutProblem | null>>
}

/**
 * The card was not charged (declined, or the payment could not open): the same orders can be
 * paid by transfer instead. Once at a time, like placing an order: a double tap sends one
 * request. Silent: the screen shows the problem next to the button.
 */
export function useDeclinedActions(orderIds: Readonly<Ref<string[]>>): IDeclinedActions {
  const router = useRouter()
  const queryClient = useQueryClient()

  const isSwitching = ref(false)
  const problem = ref<CheckoutProblem | null>(null)
  let pending: Promise<void> | null = null

  async function run() {
    const ids = [...orderIds.value]
    problem.value = null
    try {
      await httpClient.patch(
        API_ROUTES.ORDERS.PAYMENT_METHOD,
        { orderIds: ids, method: PAYMENT_METHOD.TRANSFER },
        { silent: true },
      )
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
      void queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.orders() })
      await router.replace(`${ROUTE_PATHS.CHECKOUT}/received/${ids[0]}`)
    } catch (error) {
      const failed = checkoutProblem(error)
      const serverDown = isAxiosError(error) && (error.response?.status ?? 0) >= 500
      problem.value = failed === 'unknown' && serverDown ? 'network' : failed
    }
  }

  function payByTransfer() {
    if (pending) return pending
    if (orderIds.value.length === 0) return Promise.resolve()

    isSwitching.value = true
    pending = run().finally(() => {
      isSwitching.value = false
      pending = null
    })
    return pending
  }

  return { payByTransfer, isSwitching: readonly(isSwitching), problem: readonly(problem) }
}
