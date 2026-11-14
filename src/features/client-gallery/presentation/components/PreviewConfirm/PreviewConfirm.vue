<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton } from 'naive-ui'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { useBillingSelection } from '@/features/account/composables/use-billing-selection'
import BillingAccountForm from '@/features/account/presentation/components/BillingAccountForm/BillingAccountForm.vue'
import BillingAccountPicker from '@/features/account/presentation/components/BillingAccountPicker/BillingAccountPicker.vue'
import BillingCard from '@/features/account/presentation/components/BillingCard/BillingCard.vue'
import BillingSheet from '@/shared/components/BillingSheet/BillingSheet.vue'
import CheckoutProblemAlert from '@/shared/components/CheckoutProblemAlert/CheckoutProblemAlert.vue'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { useEventPaymentOptionsQuery } from '@/shared/composables/use-event-payment-options'
import { quotePhotos } from '@/shared/pricing/quote'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { usePricingTiersQuery } from '@/shared/pricing/use-pricing-tiers'
import type { PaymentMethod } from '@/shared/types/payment-method.types'
import type { CheckoutProblem } from '@/shared/utils/checkout-error'
import type { IPhotoSelection } from '../../../composables/use-photo-selection'
import { usePlacePreviewOrder } from '../../../composables/use-place-preview-order'
import type { IPreviewData } from '../../../types/responses/preview-data.response'
import type { PreviewProblem } from '../../../utils/preview-problem'

type LinkProblem = Extract<PreviewProblem, 'already-ordered' | 'expired' | 'not-available'>

const LINK_PROBLEMS: readonly PreviewProblem[] = ['already-ordered', 'expired', 'not-available']

const METHODS: { value: PaymentMethod; title: string; text: string }[] = [
  {
    value: 'card',
    title: 'Tarjeta de crédito o débito',
    text: 'Pagas ahora y descargas de inmediato.',
  },
  {
    value: 'transfer',
    title: 'Transferencia bancaria',
    text: 'Tus fotos se liberan cuando confirmamos el pago.',
  },
]

// Confirming the order of a preview link: billing, method and consent are chosen right here,
// so nothing has to travel between screens.
const props = defineProps<{
  preview: IPreviewData
  selection: IPhotoSelection
}>()

const emit = defineEmits<{
  back: []
  linkProblem: [problem: LinkProblem]
  photosChanged: []
}>()

const router = useRouter()
const session = useSessionStore()
const token = computed(() => props.preview.token)
const eventId = computed(() => props.preview.eventId)
const isSignedIn = computed(() => session.isAuthenticated)

const chosen = computed(() =>
  props.preview.photos.filter((photo) => props.selection.isSelected(photo.id)),
)
const count = computed(() => chosen.value.length)
const { data: pricing } = usePricingTiersQuery()
const quote = computed(() => (pricing.value ? quotePhotos(pricing.value.tiers, count.value) : null))
const money = (amount: number) => formatMoney(amount, pricing.value?.currency ?? '')
const totalLabel = computed(() => (quote.value ? ` · ${money(quote.value.total)}` : ''))

const {
  billingProblem,
  isBillingRetrying,
  retryBilling,
  billingAccounts,
  needsInvoiceConsent,
  selectedBillingAccountId,
  invoiceConsentChecked,
  billingSheet,
  pickProblem,
  billingPrefill,
  isBillingReady,
  isSettingDefault,
  handleBillingSaved,
  handleBillingChosen,
  refreshBilling,
} = useBillingSelection(() => isSignedIn.value)

const { data: paymentOptions } = useEventPaymentOptionsQuery(eventId, isSignedIn)
const cardOff = ref(false)
const takesCards = computed(() => paymentOptions.value?.cardAvailable === true && !cardOff.value)
const offersCards = computed(() => paymentOptions.value?.cardAvailable === true)
const method = ref<PaymentMethod | null>(null)
const options = ref<HTMLButtonElement[]>([])

function choose(value: PaymentMethod) {
  if (value === 'card' && cardOff.value) return
  method.value = value
}

function onKeydown(event: KeyboardEvent, index: number) {
  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
  if (event.key === ' ') {
    event.preventDefault()
    choose(METHODS[index]!.value)
    return
  }
  if (!step) return
  event.preventDefault()
  const enabled = METHODS.filter((each) => !(each.value === 'card' && cardOff.value))
  const at = enabled.findIndex((each) => each.value === METHODS[index]!.value)
  const next = enabled[(at + step + enabled.length) % enabled.length]
  if (!next) return
  method.value = next.value
  void nextTick(() => options.value[METHODS.indexOf(next)]?.focus())
}

const { place, isPlacing, problem } = usePlacePreviewOrder(token)

const canConfirm = computed(
  () =>
    count.value > 0 &&
    isBillingReady.value &&
    !isPlacing.value &&
    (!offersCards.value || method.value !== null),
)

// What the page itself shows (a screen of its own, or back to picking), and what stays here.
const shownProblem = computed<CheckoutProblem | null>(() => {
  const current = problem.value
  if (!current || current === 'photos-changed' || LINK_PROBLEMS.includes(current)) return null
  return current as CheckoutProblem
})

watch(problem, (current) => {
  if (!current) return
  if (LINK_PROBLEMS.includes(current)) emit('linkProblem', current as LinkProblem)
  else if (current === 'photos-changed') emit('photosChanged')
  else if (current === 'card-unavailable') {
    cardOff.value = true
    method.value = 'transfer'
  } else if (current === 'consent' || current === 'billing') void refreshBilling()
})

async function confirm() {
  if (!canConfirm.value || !selectedBillingAccountId.value) return
  const chosenMethod: PaymentMethod = offersCards.value ? method.value! : 'transfer'
  const order = await place({
    photoIds: chosen.value.map((photo) => photo.id),
    billingAccountId: selectedBillingAccountId.value,
    method: chosenMethod,
    recordConsent: needsInvoiceConsent.value && invoiceConsentChecked.value,
  })
  if (!order) return

  if (chosenMethod === 'transfer') {
    props.selection.clear()
    void router.replace(`${ROUTE_PATHS.CHECKOUT}/received/${order.id}`)
  } else {
    void router.push({
      path: ROUTE_PATHS.PAYMENT_BOX,
      query: { orders: order.id, evento: eventId.value },
    })
  }
}
</script>

<template>
  <section class="preview-confirm">
    <div class="preview-confirm__title-row">
      <button
        type="button"
        class="preview-confirm__back"
        aria-label="Volver a elegir fotos"
        @click="emit('back')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <h1 class="preview-confirm__title">Confirmar pedido</h1>
    </div>

    <div class="preview-confirm__columns">
      <div class="preview-confirm__main">
        <h2 class="preview-confirm__event">{{ preview.eventName }}</h2>
        <ul class="preview-confirm__thumbs">
          <li v-for="photo in chosen" :key="photo.id" class="preview-confirm__thumb">
            <img :src="photo.url" alt="Foto del pedido" loading="lazy" decoding="async" />
          </li>
        </ul>
        <div v-if="quote" class="preview-confirm__price">
          <div class="preview-confirm__row">
            <span class="preview-confirm__muted">Precio por foto</span>
            <span
              ><strong>{{ money(quote.unitPrice) }}</strong> c/u</span
            >
          </div>
          <div class="preview-confirm__row">
            <span class="preview-confirm__muted">
              Total · {{ count }} {{ count === 1 ? 'foto' : 'fotos' }}
            </span>
            <span class="preview-confirm__total">{{ money(quote.total) }}</span>
          </div>
        </div>
      </div>

      <div class="preview-confirm__side">
        <FormAlert
          v-if="billingProblem"
          data-test="billing-problem"
          tone="warn"
          title="No pudimos cargar tus datos de facturación"
          text="Puede ser tu conexión."
          :retrying="isBillingRetrying"
          @retry="retryBilling()"
        />
        <BillingCard
          v-else
          v-model:consented="invoiceConsentChecked"
          :accounts="billingAccounts"
          :selected-id="selectedBillingAccountId"
          :needs-consent="needsInvoiceConsent && billingAccounts.length > 0"
          @add="billingSheet = 'form'"
          @change="billingSheet = 'picker'"
        />

        <div
          v-if="offersCards"
          class="preview-confirm__methods"
          role="radiogroup"
          aria-label="Método de pago"
        >
          <span class="preview-confirm__eyebrow">Método de pago</span>
          <button
            v-for="(option, index) in METHODS"
            :key="option.value"
            ref="options"
            type="button"
            role="radio"
            class="preview-confirm__option"
            :aria-checked="method === option.value ? 'true' : 'false'"
            :aria-disabled="option.value === 'card' && cardOff ? 'true' : undefined"
            :tabindex="(method ?? (cardOff ? 'transfer' : 'card')) === option.value ? 0 : -1"
            @click="choose(option.value)"
            @keydown="onKeydown($event, index)"
          >
            <span class="preview-confirm__radio" aria-hidden="true" />
            <span class="preview-confirm__copy">
              <strong>{{ option.title }}</strong>
              <span>{{ option.text }}</span>
            </span>
          </button>
        </div>

        <CheckoutProblemAlert
          v-if="shownProblem"
          :problem="shownProblem"
          :gallery-path="`/preview/${preview.token}`"
        />

        <div class="preview-confirm__actions">
          <NButton
            type="primary"
            size="large"
            block
            data-test="preview-confirm"
            :loading="isPlacing"
            :disabled="!canConfirm"
            :aria-busy="isPlacing ? 'true' : undefined"
            @click="confirm"
          >
            Confirmar pedido{{ totalLabel }}
          </NButton>
          <p v-if="paymentOptions && !takesCards && !offersCards" class="preview-confirm__hint">
            Se paga por transferencia. Al confirmar, te escribimos por WhatsApp con el total y los
            datos para pagar.
          </p>
        </div>
      </div>
    </div>

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
        :problem="pickProblem"
        @choose="handleBillingChosen"
        @add="billingSheet = 'form'"
      />
    </BillingSheet>
  </section>
</template>

<style scoped src="./preview-confirm.css" />
