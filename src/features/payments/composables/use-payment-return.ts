import { useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { computed, onScopeDispose, readonly, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { ACCOUNT_QUERY_KEYS } from '@/features/account/constants/query-keys'
import { toMyOrderDetail } from '@/features/account/mappers/my-order.mapper'
import type {
  IApiMyOrderDetail,
  IMyOrderDetail,
} from '@/features/account/types/responses/my-order.response'
import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { PAYMENT_QUERY_KEYS } from '../constants/query-keys'
import { DEFAULT_PAYMENT_PROVIDER, findPaymentGateway } from '../gateways/registry'
import type { IPaymentTransaction } from '../types/responses/payment-intent.response'
import {
  LATE_AFTER_MS,
  paymentOutcome,
  type IConfirmAnswer,
  type ITransactionAnswer,
  type PaymentOutcome,
} from '../utils/payment-outcome'
import { useConfirmPayment } from './mutations/use-confirm-payment'

/** While late, the state is asked again this often… */
const POLL_EVERY_MS = 5_000
/** …for this long. After that the screen stays late: the order is in Mis fotos either way. */
const POLL_FOR_MS = 120_000

const RESOLVED_DECLINED = new Set(['declined', 'expired', 'reversed', 'cancelled'])

export interface IPaymentReturn {
  outcome: Readonly<Ref<PaymentOutcome>>
  orderIds: Readonly<Ref<string[]>>
  /** Still waiting for an answer. False once the two minutes of asking are over. */
  isAsking: Readonly<Ref<boolean>>
  retry(): void
}

/**
 * The buyer is back from the gateway. Asks once whether the charge went through and keeps the
 * screen honest while the answer takes: late after ten seconds, asking again every five seconds
 * for two minutes. A charge approved but not settled is never shown as paid.
 *
 * Reloading or coming back with the browser does not charge again: a transaction that already
 * has a final "no" is read, not confirmed (and the server answers a repeated confirmation with
 * the answer it already gave).
 */
export function usePaymentReturn(): IPaymentReturn {
  const route = useRoute()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutateAsync: confirmPayment } = useConfirmPayment()

  const provider = String(route.meta.provider ?? DEFAULT_PAYMENT_PROVIDER)
  const confirmation = findPaymentGateway(provider)?.parseReturn(route.query) ?? null

  // Back without a payment id (id=0, or none): the buyer cancelled at the gateway, nothing was
  // charged and there is nothing to confirm. Its orders are still read, for the ways out.
  const cancelledAtGateway = confirmation === null
  const cancelledTransactionId = String(route.query.clientTransactionId ?? '')

  const answer = ref<IConfirmAnswer | ITransactionAnswer | null>(null)
  const isLate = ref(false)
  const requestFailed = ref(false)
  const orderIds = ref<string[]>([])

  const outcome = computed<PaymentOutcome>(() =>
    cancelledAtGateway
      ? 'cancelled'
      : paymentOutcome(answer.value, isLate.value ? LATE_AFTER_MS : 0, requestFailed.value),
  )

  let lateTimer: ReturnType<typeof setTimeout> | undefined
  let pollTimer: ReturnType<typeof setInterval> | undefined
  let pollStopTimer: ReturnType<typeof setTimeout> | undefined
  let disposed = false
  const polling = ref(false)

  function stopPolling() {
    clearInterval(pollTimer)
    clearTimeout(pollStopTimer)
    pollTimer = undefined
    polling.value = false
  }

  function fetchTransaction(id: string) {
    return queryClient.fetchQuery({
      queryKey: PAYMENT_QUERY_KEYS.transaction(id),
      queryFn: async () =>
        (
          await httpClient.get<IPaymentTransaction>(API_ROUTES.PAYMENTS.TRANSACTION(id), {
            silent: true,
          })
        ).data,
      staleTime: 0,
    })
  }

  function fetchOrder(id: string): Promise<IMyOrderDetail> {
    return queryClient.fetchQuery({
      queryKey: ACCOUNT_QUERY_KEYS.order(id),
      queryFn: async () =>
        toMyOrderDetail(
          (
            await httpClient.get<IApiMyOrderDetail>(API_ROUTES.MY_ORDERS.GET_BY_ID(id), {
              silent: true,
            })
          ).data,
        ),
      staleTime: 0,
    })
  }

  // One more look while late. Only a ready order counts as paid: an approved transaction may
  // still have its orders unsettled. An order that is gone was rejected or expired.
  async function poll(transactionId: string) {
    const [transaction, firstOrder] = await Promise.allSettled([
      fetchTransaction(transactionId),
      orderIds.value[0] ? fetchOrder(orderIds.value[0]) : Promise.resolve(null),
    ])
    if (disposed || outcome.value !== 'late') return

    if (transaction.status === 'fulfilled') {
      if (orderIds.value.length === 0) orderIds.value = transaction.value.orderIds
      if (RESOLVED_DECLINED.has(transaction.value.status)) {
        answer.value = { status: transaction.value.status }
        return
      }
    }
    if (
      firstOrder.status === 'rejected' &&
      isAxiosError(firstOrder.reason) &&
      firstOrder.reason.response?.status === 404
    ) {
      answer.value = { status: 'declined' }
      return
    }
    if (firstOrder.status === 'fulfilled' && firstOrder.value?.state === 'ready') {
      answer.value = { approved: true, settled: true }
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
    }
  }

  async function run() {
    if (!confirmation) return
    answer.value = null
    requestFailed.value = false
    isLate.value = false
    clearTimeout(lateTimer)
    lateTimer = setTimeout(() => (isLate.value = true), LATE_AFTER_MS)

    try {
      const transaction = await fetchTransaction(confirmation.clientTransactionId)
      orderIds.value = transaction.orderIds
      if (RESOLVED_DECLINED.has(transaction.status)) {
        answer.value = { status: transaction.status }
        return
      }
    } catch {
      // Unknown yet: confirming answers it.
    }

    try {
      const result = await confirmPayment(confirmation)
      if (disposed) return
      if (result.orderIds.length > 0) orderIds.value = result.orderIds
      // A "no" that arrived while polling already told the truth: keep it.
      if (outcome.value !== 'declined') answer.value = result
    } catch {
      if (!disposed && !answer.value) requestFailed.value = true
    }
  }

  watch(outcome, (current) => {
    if (current === 'late' && !pollTimer && confirmation) {
      const id = confirmation.clientTransactionId
      pollTimer = setInterval(() => void poll(id), POLL_EVERY_MS)
      polling.value = true
      pollStopTimer = setTimeout(stopPolling, POLL_FOR_MS)
      return
    }
    if (current !== 'late') stopPolling()
    if (current === 'confirmed' && orderIds.value[0]) {
      void router.replace(`${ROUTE_PATHS.CHECKOUT}/confirmed/${orderIds.value[0]}`)
    }
  })

  onScopeDispose(() => {
    disposed = true
    clearTimeout(lateTimer)
    stopPolling()
  })

  async function findCancelledOrders() {
    if (!cancelledTransactionId) return
    try {
      const transaction = await fetchTransaction(cancelledTransactionId)
      if (!disposed) orderIds.value = transaction.orderIds
    } catch {
      // Not known: the screen leads to Mis fotos instead.
    }
  }

  if (cancelledAtGateway) void findCancelledOrders()
  else void run()

  return {
    outcome: readonly(outcome),
    orderIds: readonly(orderIds) as Readonly<Ref<string[]>>,
    isAsking: computed(
      () => outcome.value === 'confirming' || (outcome.value === 'late' && polling.value),
    ),
    retry: () => void run(),
  }
}
