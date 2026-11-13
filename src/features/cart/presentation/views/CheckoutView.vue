<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { NButton } from 'naive-ui'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { checkoutPath, ROUTE_PATHS } from '@/core/navigation/route-paths'
import { useBillingSelection } from '@/features/account/composables/use-billing-selection'
import HouseSpot from '@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue'
import BillingAccountForm from '@/features/account/presentation/components/BillingAccountForm/BillingAccountForm.vue'
import BillingAccountPicker from '@/features/account/presentation/components/BillingAccountPicker/BillingAccountPicker.vue'
import BillingCard from '@/features/account/presentation/components/BillingCard/BillingCard.vue'
import { useCartState } from '@/shared/cart'
import BillingSheet from '@/shared/components/BillingSheet/BillingSheet.vue'
import { EmptyState } from '@/shared/components/empty-state'
import { LoadBoundary, TtSkeleton } from '@/shared/components/loading'
import SessionExpiredNotice from '@/shared/components/SessionExpiredNotice/SessionExpiredNotice.vue'
import { useEventPaymentOptionsQuery } from '@/shared/composables/use-event-payment-options'
import { quotePhotos } from '@/shared/pricing/quote'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { usePricingTiersQuery } from '@/shared/pricing/use-pricing-tiers'
import { useCheckoutDraftStore } from '../../stores/checkout-draft.store'
import { usePlaceOrder } from '../../composables/use-place-order'
import CheckoutProblemAlert from '@/shared/components/CheckoutProblemAlert/CheckoutProblemAlert.vue'
import CheckoutSummary from '../components/CheckoutSummary/CheckoutSummary.vue'

const SKELETON_THUMBS = 3

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const eventId = computed(() => route.params.eventId as string)
const isSignedIn = computed(() => session.isAuthenticated)
// The house strip: under the summary from 768 px, under the buttons on a phone; not for a guest.
const SPOT_SEED = 31
const isWide = useMediaQuery('(min-width: 768px)')

// --- The order: the photos of this event in the cart ---
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
const totalLabel = computed(() => {
  const quote = pricing.value ? quotePhotos(pricing.value.tiers, count.value) : null
  return quote && pricing.value ? ` · ${formatMoney(quote.total, pricing.value.currency)}` : ''
})

// --- Billing and how the event is paid ---
const {
  isBillingLoaded,
  billingAccounts,
  needsInvoiceConsent,
  selectedBillingAccountId,
  invoiceConsentChecked,
  billingSheet,
  billingPrefill,
  isBillingReady,
  isSettingDefault,
  handleBillingSaved,
  handleBillingChosen,
  refreshBilling,
} = useBillingSelection(() => isSignedIn.value)

const { data: paymentOptions, isLoading: isLoadingOptions } = useEventPaymentOptionsQuery(
  eventId,
  isSignedIn,
)
const takesCards = computed(() => paymentOptions.value?.cardAvailable === true)

// --- Placing the order ---
const { place, isPlacing, problem } = usePlaceOrder()

// The server answered from data this screen no longer agrees with: read it again.
watch(
  problem,
  (current) => {
    if (current === 'cart-missing') void cart.refetch()
    if (current === 'consent' || current === 'billing') void refreshBilling()
  },
  { immediate: true },
)

const canContinue = computed(
  () => isBillingReady.value && !isLoadingOptions.value && !isPlacing.value,
)

// The draft lives while the buyer moves between this screen and the method screen of the event.
const drafts = useCheckoutDraftStore()
const draftEventId = route.params.eventId as string
onBeforeUnmount(() => {
  if (router.currentRoute.value.path !== `${checkoutPath(draftEventId)}/method`) {
    drafts.forget(draftEventId)
  }
})

async function confirm() {
  if (!canContinue.value || !selectedBillingAccountId.value) return

  if (takesCards.value) {
    // The method screen creates the order: it gets the billing data chosen here and whether the
    // consent box was ticked, in memory, never in the address.
    drafts.keep(eventId.value, {
      billingAccountId: selectedBillingAccountId.value,
      consentChecked: needsInvoiceConsent.value && invoiceConsentChecked.value,
    })
    router.push(`${checkoutPath(eventId.value)}/method`)
    return
  }

  const orders = await place({
    eventId: eventId.value,
    method: 'transfer',
    billingAccountId: selectedBillingAccountId.value,
    recordConsent: needsInvoiceConsent.value && invoiceConsentChecked.value,
  })
  // Replaced: going back from the received order must not land on a checkout already used.
  if (orders?.[0]) router.replace(`${ROUTE_PATHS.CHECKOUT}/received/${orders[0].orderId}`)
}
</script>

<template>
  <div class="checkout">
    <div class="checkout__title-row">
      <RouterLink class="checkout__back" :to="galleryPath" aria-label="Volver a la galería">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </RouterLink>
      <h1 class="checkout__title">Confirmar pedido</h1>
    </div>

    <!-- The session expired with the order on screen: say so, it is not an order without photos. -->
    <SessionExpiredNotice
      v-if="session.expired"
      text="Inicia sesión de nuevo para seguir con tu pedido. Tus fotos siguen guardadas."
    />

    <LoadBoundary
      v-else
      :status="cart.status.value"
      :empty="!group"
      :refreshing="cart.status.value === 'error' && cart.isFetching.value"
      error-title="No pudimos cargar tu carrito"
      error-text="Puede ser tu conexión."
      @retry="cart.refetch()"
    >
      <template #skeleton>
        <div class="checkout__skeleton">
          <TtSkeleton width="60%" height="var(--tt-space-5)" radius="text" />
          <div class="checkout__skeleton-thumbs">
            <TtSkeleton
              v-for="n in SKELETON_THUMBS"
              :key="n"
              class="checkout__skeleton-thumb"
              height="auto"
              radius="m"
            />
          </div>
          <TtSkeleton height="var(--tt-control-m)" radius="m" />
        </div>
      </template>

      <template #empty>
        <EmptyState
          illustration="carritoVacio"
          title="No hay fotos en este pedido"
          text="Vuelve a la galería y agrega las fotos que quieras."
        >
          <template #actions>
            <RouterLink v-slot="{ href, navigate }" :to="ROUTE_PATHS.PUBLIC_GALLERY" custom>
              <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
                Volver a la galería
              </NButton>
            </RouterLink>
          </template>
        </EmptyState>
      </template>

      <div v-if="group" class="checkout__columns">
        <section class="checkout__main">
          <div class="checkout__event">
            <h2 class="checkout__event-name">{{ group.eventName }}</h2>
          </div>
          <CheckoutSummary :group="group" />
          <HouseSpot v-if="isSignedIn && isWide" format="D" :seed="SPOT_SEED" />
        </section>

        <aside class="checkout__side">
          <div v-if="!isSignedIn" class="checkout__notice" role="status">
            <strong>Inicia sesión para comprar</strong>
            <p>
              Tus {{ count }}
              {{ count === 1 ? 'foto se queda guardada' : 'fotos se quedan guardadas' }} en el
              carrito.
            </p>
          </div>

          <BillingCard
            v-else
            v-model:consented="invoiceConsentChecked"
            :accounts="billingAccounts"
            :selected-id="selectedBillingAccountId"
            :needs-consent="needsInvoiceConsent && billingAccounts.length > 0"
            @add="billingSheet = 'form'"
            @change="billingSheet = 'picker'"
          />

          <CheckoutProblemAlert v-if="problem" :problem="problem" :gallery-path="galleryPath" />

          <div class="checkout__actions">
            <RouterLink
              v-if="!isSignedIn"
              v-slot="{ href, navigate }"
              :to="{ path: ROUTE_PATHS.LOGIN, query: { redirect: checkoutPath(eventId) } }"
              custom
            >
              <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
                Iniciar sesión para continuar
              </NButton>
            </RouterLink>

            <template v-else>
              <NButton
                type="primary"
                size="large"
                block
                data-test="checkout-confirm"
                :loading="isPlacing"
                :disabled="!canContinue"
                :aria-busy="isPlacing ? 'true' : undefined"
                @click="confirm"
              >
                {{ takesCards ? 'Continuar al pago' : 'Confirmar pedido' }}{{ totalLabel }}
              </NButton>
              <p v-if="isBillingLoaded && !selectedBillingAccountId" class="checkout__hint">
                Agrega tus datos de facturación para confirmar.
              </p>
              <p v-else-if="paymentOptions && !takesCards" class="checkout__hint">
                Este evento se paga por transferencia. Al confirmar, te escribimos por WhatsApp con
                el total y los datos para pagar.
              </p>
            </template>

            <RouterLink class="checkout__link" :to="ROUTE_PATHS.PUBLIC_GALLERY">
              Seguir explorando
            </RouterLink>
          </div>
          <HouseSpot v-if="isSignedIn && !isWide" format="D" :seed="SPOT_SEED" />
        </aside>
      </div>
    </LoadBoundary>

    <BillingSheet
      v-if="billingSheet"
      :title="billingSheet === 'form' ? 'Datos de facturación' : '¿A nombre de quién?'"
      @close="billingSheet = null"
    >
      <BillingAccountForm
        v-if="billingSheet === 'form'"
        :needs-consent="needsInvoiceConsent"
        :prefill="billingPrefill"
        @saved="handleBillingSaved"
        @cancel="billingSheet = null"
      />
      <BillingAccountPicker
        v-else
        :accounts="billingAccounts"
        :selected-id="selectedBillingAccountId"
        :is-saving="isSettingDefault"
        @choose="handleBillingChosen"
        @add="billingSheet = 'form'"
      />
    </BillingSheet>
  </div>
</template>

<style scoped src="./checkout-view.css" />
