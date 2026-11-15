<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton } from 'naive-ui'

import { checkoutPath, ROUTE_PATHS } from '@/core/navigation/route-paths'
import { useBillingSelection } from '@/features/account/composables/use-billing-selection'
import { useCartState } from '@/shared/cart'
import { useEventPaymentOptionsQuery } from '@/shared/composables/use-event-payment-options'
import { quotePhotos } from '@/shared/pricing/quote'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { usePricingTiersQuery } from '@/shared/pricing/use-pricing-tiers'
import type { PaymentMethod } from '@/shared/types/payment-method.types'
import { usePlaceOrder } from '../../composables/use-place-order'
import { useCheckoutDraftStore } from '../../stores/checkout-draft.store'
import CheckoutProblemAlert from '@/shared/components/CheckoutProblemAlert/CheckoutProblemAlert.vue'

interface IMethodOption {
  value: PaymentMethod
  title: string
  text: string
}

const OPTIONS: IMethodOption[] = [
  {
    value: 'card',
    title: 'Tarjeta de crédito o débito',
    text: 'Pagas ahora y descargas tus fotos de inmediato.',
  },
  {
    value: 'transfer',
    title: 'Transferencia bancaria',
    text: 'Te escribimos por WhatsApp con los datos para pagar. Tus fotos se liberan cuando confirmamos el pago.',
  },
]

const route = useRoute()
const router = useRouter()

// Fixed on entering: while the buyer leaves, the route already points elsewhere and this screen
// must not act on it (no way leads from one event's method screen to another's).
const draftEventId = route.params.eventId as string
const eventId = computed(() => draftEventId)
const checkout = computed(() => checkoutPath(draftEventId))

// What the buyer chose on the confirm screen, kept in memory. Never read from the address: the
// invoice consent counts only when it comes from the box. A reload or a direct link has none.
const drafts = useCheckoutDraftStore()
const draft = computed(() => drafts.draftFor(draftEventId))
const billingAccountId = computed(() => draft.value?.billingAccountId ?? null)
const consentTicked = computed(() => draft.value?.consentChecked === true)

// Back to the confirm screen keeps the draft; anywhere else ends this purchase.
onBeforeUnmount(() => {
  if (router.currentRoute.value.path !== checkoutPath(draftEventId)) drafts.forget(draftEventId)
})

// --- What this screen needs, read again: it can be opened from a bookmark or history ---
const cart = useCartState()
const group = computed(
  () => cart.groups.value.find((each) => each.eventId === eventId.value) ?? null,
)
const count = computed(() => group.value?.photos.length ?? 0)
const galleryPath = computed(() =>
  group.value
    ? `${ROUTE_PATHS.PUBLIC_GALLERY}/${group.value.eventSlug}`
    : ROUTE_PATHS.PUBLIC_GALLERY,
)

const { data: pricing } = usePricingTiersQuery()
const total = computed(() => {
  const quote = pricing.value ? quotePhotos(pricing.value.tiers, count.value) : null
  return quote && pricing.value ? formatMoney(quote.total, pricing.value.currency) : null
})

const { isBillingLoaded, billingAccounts, needsInvoiceConsent } = useBillingSelection(() => true)
const { data: paymentOptions } = useEventPaymentOptionsQuery(
  eventId,
  computed(() => true),
)

const { place, isPlacing, problem } = usePlaceOrder()

// The order failed and the cart, read again, no longer has the photos: the order may have been
// created after all (a lost answer, another tab). The notice stays, with nothing left to pay.
const photosGone = computed(
  () => problem.value !== null && cart.status.value === 'success' && !group.value,
)

// Nothing to choose here without photos, billing data or cards: back to the confirm screen,
// which says what is missing. Decided only once each answer is in.
const sendBack = computed(() => {
  if (!billingAccountId.value) return true
  if (cart.status.value === 'success' && !group.value && !photosGone.value) return true
  if (isBillingLoaded.value) {
    const known = billingAccounts.value.some((account) => account.id === billingAccountId.value)
    if (!known || (needsInvoiceConsent.value && !consentTicked.value)) return true
  }
  return paymentOptions.value?.cardAvailable === false
})
// Set when this screen navigates on: the route it leaves for has none of this screen's data.
let leaving = false
watch(
  sendBack,
  (back) => {
    if (back && !leaving) void router.replace(checkout.value)
  },
  { immediate: true },
)

// --- The choice: a radio group, nothing chosen until the buyer picks ---
const choice = ref<PaymentMethod | null>(null)
const cardOff = ref(false)
const optionRefs = ref<HTMLButtonElement[]>([])

const isOff = (option: IMethodOption) => option.value === 'card' && cardOff.value
const enabledOptions = computed(() => OPTIONS.filter((option) => !isOff(option)))
const focusable = computed(() => choice.value ?? enabledOptions.value[0]?.value ?? null)

// The card stopped being available between choosing it and continuing: the order can still
// be paid by transfer, already chosen for the buyer.
watch(problem, (current) => {
  if (current !== 'card-unavailable') return
  cardOff.value = true
  choice.value = 'transfer'
})

function choose(option: IMethodOption) {
  if (!isOff(option)) choice.value = option.value
}

function onKeydown(event: KeyboardEvent, option: IMethodOption) {
  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
  if (event.key === ' ') {
    event.preventDefault()
    choose(option)
    return
  }
  if (!step) return
  event.preventDefault()
  const options = enabledOptions.value
  const at = options.findIndex((each) => each.value === option.value)
  const next = options[(at + step + options.length) % options.length]
  if (!next) return
  choice.value = next.value
  void nextTick(() => optionRefs.value[OPTIONS.indexOf(next)]?.focus())
}

async function proceed() {
  if (!choice.value || !billingAccountId.value || isPlacing.value) return
  const method = choice.value

  const orders = await place({
    eventId: eventId.value,
    method,
    billingAccountId: billingAccountId.value,
    recordConsent: consentTicked.value,
  })
  if (!orders?.[0]) return

  drafts.forget(draftEventId)
  leaving = true
  if (method === 'transfer') {
    router.replace(`${ROUTE_PATHS.CHECKOUT}/received/${orders[0].orderId}`)
  } else {
    router.push({
      path: ROUTE_PATHS.PAYMENT_BOX,
      // The event lets the card screen lead back to this order.
      query: { orders: orders.map((order) => order.orderId).join(','), evento: eventId.value },
    })
  }
}
</script>

<template>
  <div v-if="draft" class="payment-method">
    <div class="payment-method__title-row">
      <RouterLink class="payment-method__back" :to="checkout" aria-label="Volver al pedido">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </RouterLink>
      <h1 class="payment-method__title">Método de pago</h1>
    </div>

    <div v-if="!photosGone" class="payment-method__total">
      <span class="payment-method__muted">
        Total · {{ count }} {{ count === 1 ? 'foto' : 'fotos' }}
      </span>
      <span v-if="total" class="payment-method__amount">{{ total }}</span>
    </div>

    <div
      v-if="!photosGone"
      class="payment-method__options"
      role="radiogroup"
      aria-label="Método de pago"
    >
      <button
        v-for="option in OPTIONS"
        :key="option.value"
        ref="optionRefs"
        type="button"
        role="radio"
        class="payment-method__option"
        :aria-checked="choice === option.value ? 'true' : 'false'"
        :aria-disabled="isOff(option) ? 'true' : undefined"
        :tabindex="focusable === option.value ? 0 : -1"
        @click="choose(option)"
        @keydown="onKeydown($event, option)"
      >
        <span class="payment-method__radio" aria-hidden="true" />
        <span class="payment-method__copy">
          <strong>{{ option.title }}</strong>
          <span>{{ option.text }}</span>
        </span>
      </button>
    </div>

    <CheckoutProblemAlert v-if="problem" :problem="problem" :gallery-path="galleryPath" />

    <div v-if="!photosGone" class="payment-method__actions">
      <NButton
        type="primary"
        size="large"
        block
        data-test="method-continue"
        :loading="isPlacing"
        :disabled="!choice || isPlacing"
        :aria-busy="isPlacing ? 'true' : undefined"
        @click="proceed"
      >
        Continuar
      </NButton>
      <!-- Only while nothing went wrong: after a lost answer the order may already exist. -->
      <p v-if="!problem" class="payment-method__note">
        Todavía no se registra nada. El pedido se crea al continuar.
      </p>
    </div>
  </div>
</template>

<style scoped src="./payment-method-view.css" />
