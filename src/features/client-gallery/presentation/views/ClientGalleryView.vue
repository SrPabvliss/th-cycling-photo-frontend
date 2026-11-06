<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NModal, NRadio, NRadioGroup, NSpin } from 'naive-ui'
import {
  CloseCircleOutline,
  ImagesOutline,
  SendOutline,
  ChatbubblesOutline,
  CardOutline,
  CloudDownloadOutline,
} from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { useAuth } from '@/features/auth/composables/use-auth'
import { useBillingSelection } from '@/features/account/composables/use-billing-selection'
import BillingAccountForm from '@/features/account/presentation/components/BillingAccountForm/BillingAccountForm.vue'
import BillingAccountPicker from '@/features/account/presentation/components/BillingAccountPicker/BillingAccountPicker.vue'
import BillingCard from '@/features/account/presentation/components/BillingCard/BillingCard.vue'
import { usePricingPreviewQuery } from '@/features/pricing/composables/queries/use-pricing-preview'
import PricingTotalBlock from '@/features/pricing/presentation/components/PricingTotalBlock/PricingTotalBlock.vue'
import BillingSheet from '@/shared/components/BillingSheet/BillingSheet.vue'
import { useEventPaymentOptionsQuery } from '@/shared/composables/use-event-payment-options'
import { PAYMENT_METHOD, type PaymentMethod } from '@/shared/types/payment-method.types'
import { usePreviewGallery } from '../../composables/queries/use-preview-gallery'
import { useCreateOrder } from '../../composables/mutations/use-create-order'
import { usePhotoSelection } from '../../composables/use-photo-selection'
import { toCreateOrderRequest } from '../../mappers/create-order.mapper'
import { toPreviewOrderFailure, type PreviewOrderFix } from '../../utils/preview-order-error'
import { formatDate } from '@/shared/utils/date.utils'
import type { IContactFormData } from '../../constants/contact-form.schema'
import GalleryCarousel from '../components/GalleryCarousel/GalleryCarousel.vue'
import ContactForm from '../components/ContactForm/ContactForm.vue'
import OrderConfirmation from '../components/OrderConfirmation/OrderConfirmation.vue'
import PreviewExpired from '../components/PreviewExpired/PreviewExpired.vue'
import PreviewAlreadyOrdered from '../components/PreviewAlreadyOrdered/PreviewAlreadyOrdered.vue'
import PreviewNotFound from '@/shared/components/PreviewNotFound/PreviewNotFound.vue'
import { pluralize } from '@/shared/utils/format.utils'

type ViewStep = 'gallery' | 'contact' | 'confirmation'

const route = useRoute()
const router = useRouter()
const token = computed(() => route.params.token as string)

const { isAuthenticated, login, isLoggingIn } = useAuth()
const {
  data: preview,
  isPending,
  isError,
  isExpired,
  isNotFound,
  isConverted,
  refetch,
} = usePreviewGallery(token)
const { mutateAsync: createOrder, isPending: isSubmitting } = useCreateOrder(token.value)

/** Set when submitting the order reveals the preview is no longer usable. */
const orderBlockedBy = ref<'already_ordered' | 'expired' | 'not_found' | null>(null)
const orderErrorMessage = ref<string | null>(null)
const orderErrorFix = ref<PreviewOrderFix | null>(null)

const ERROR_ACTION_LABELS: Partial<Record<PreviewOrderFix, string>> = {
  complete_profile: 'Completar mi perfil',
  pick_billing: 'Elegir datos de facturación',
}
const orderErrorActionLabel = computed(() =>
  orderErrorFix.value ? (ERROR_ACTION_LABELS[orderErrorFix.value] ?? null) : null,
)

const showExpired = computed(() => isExpired.value || orderBlockedBy.value === 'expired')
const showNotFound = computed(() => isNotFound.value || orderBlockedBy.value === 'not_found')
const showAlreadyOrdered = computed(
  () => isConverted.value || orderBlockedBy.value === 'already_ordered',
)

const previewPhotos = computed(() => preview.value?.photos)
const {
  selectedIds,
  selectedCount,
  selectedPhotos,
  allSelected,
  selectAll,
  clearSelection,
  toggleSelect,
  removeFromSelection,
  forgetSelection,
} = usePhotoSelection(previewPhotos, token)

function toggleSelectAll() {
  if (allSelected.value) {
    clearSelection()
  } else {
    selectAll()
  }
}

// --- Billing, price and payment method (same rules as the cart checkout) ---
const {
  billingAccounts,
  needsInvoiceConsent,
  selectedBillingAccountId,
  invoiceConsentChecked,
  billingSheet,
  billingPrefill,
  isBillingReady,
  isSettingDefault,
  isRecordingConsent,
  handleBillingSaved,
  handleBillingChosen,
  ensureInvoiceConsent,
  refreshBilling,
} = useBillingSelection(() => isAuthenticated.value)

const { data: pricing, isLoading: isPricingLoading } = usePricingPreviewQuery(selectedCount)

const previewEventId = computed(() => preview.value?.eventId ?? '')
const { data: paymentOptions, isLoading: isLoadingPaymentOptions } = useEventPaymentOptionsQuery(
  previewEventId,
  isAuthenticated,
)
// The server can turn card down at submit time (payment.card_unavailable).
const cardRejected = ref(false)
const cardAvailable = computed(
  () => !cardRejected.value && (paymentOptions.value?.cardAvailable ?? false),
)
const paymentMethod = ref<PaymentMethod>(PAYMENT_METHOD.TRANSFER)
watch(cardAvailable, (available) => {
  if (!available) paymentMethod.value = PAYMENT_METHOD.TRANSFER
})

const isCheckoutBlocked = computed(
  () => !isBillingReady.value || isLoadingPaymentOptions.value || isPricingLoading.value,
)

const step = ref<ViewStep>('gallery')
const submittedPhotoCount = ref(0)
const showLoginModal = ref(false)

// --- Login modal state ---
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')

function goToContact() {
  if (selectedCount.value === 0) return

  if (!isAuthenticated.value) {
    showLoginModal.value = true
    return
  }

  step.value = 'contact'
}

async function handleModalLogin() {
  loginError.value = ''
  try {
    await login({ email: loginEmail.value.trim(), password: loginPassword.value })
    showLoginModal.value = false
    step.value = 'contact'
  } catch {
    loginError.value = 'Credenciales incorrectas'
  }
}

function goToRegister() {
  showLoginModal.value = false
  router.push({ path: '/register', query: { redirect: route.fullPath } })
}

/** Applies right away what can be fixed without the buyer, the rest waits for a click. */
function applyOrderFix(fix: PreviewOrderFix | null) {
  if (fix === 'transfer_only') {
    cardRejected.value = true
    paymentMethod.value = PAYMENT_METHOD.TRANSFER
  }
  if (fix === 'accept_consent' || fix === 'pick_billing') refreshBilling()
}

function handleOrderErrorAction() {
  if (orderErrorFix.value === 'complete_profile') {
    // New tab: the selection lives in this page and would be lost on navigation.
    const { href } = router.resolve({ name: ROUTE_NAMES.ACCOUNT_PROFILE })
    window.open(href, '_blank', 'noopener')
    return
  }
  if (orderErrorFix.value === 'pick_billing') {
    billingSheet.value = billingAccounts.value.length > 0 ? 'picker' : 'form'
  }
}

function goBackToGallery() {
  orderErrorMessage.value = null
  orderErrorFix.value = null
  step.value = 'gallery'
}

async function handleSubmit(formData: IContactFormData) {
  orderErrorMessage.value = null
  orderErrorFix.value = null
  const billingAccountId = selectedBillingAccountId.value
  if (!billingAccountId || isCheckoutBlocked.value) return

  let orderId: string
  try {
    await ensureInvoiceConsent()
    const order = await createOrder(
      toCreateOrderRequest(formData, selectedIds.value, {
        billingAccountId,
        method: paymentMethod.value,
      }),
    )
    orderId = order.id
  } catch (caught) {
    const failure = toPreviewOrderFailure(caught)
    if (failure.kind === 'message') {
      orderErrorMessage.value = failure.message
      orderErrorFix.value = failure.fix
      applyOrderFix(failure.fix)
    } else {
      orderBlockedBy.value = failure.kind
    }
    return
  }

  if (paymentMethod.value === PAYMENT_METHOD.CARD) {
    // Same as the cart checkout: the payment box creates the intent for the draft order.
    forgetSelection()
    router.push({ name: ROUTE_NAMES.PAYMENT_BOX, query: { orders: orderId } })
    return
  }

  submittedPhotoCount.value = selectedCount.value
  forgetSelection()
  step.value = 'confirmation'
}
</script>

<template>
  <PublicLayout>
    <!-- Full-width state pages -->
    <div v-if="isPending" class="cg-center">
      <NSpin size="large" />
      <p class="cg-muted">Cargando tus fotos...</p>
    </div>

    <PreviewExpired v-else-if="showExpired" />

    <PreviewNotFound v-else-if="showNotFound" />

    <PreviewAlreadyOrdered v-else-if="showAlreadyOrdered" :event-name="preview?.eventName ?? ''" />

    <div v-else-if="isError && !preview" class="cg-center" data-test="preview-load-error">
      <NIcon :component="CloseCircleOutline" :size="48" color="#d03050" />
      <p class="cg-center__title">No pudimos cargar tus fotos</p>
      <p class="cg-muted">
        Puede ser tu conexión o un problema de nuestro lado. Inténtalo de nuevo.
      </p>
      <NButton type="primary" @click="refetch()">Reintentar</NButton>
    </div>

    <!-- Active preview -->
    <template v-else-if="preview">
      <!-- Step 1: Gallery (full viewport) -->
      <div v-if="step === 'gallery'" class="cg-gallery">
        <!-- Left: viewer -->
        <div class="cg-viewer-col">
          <div class="cg-event-header">
            <p class="cg-event-meta">
              <template v-if="preview.startDate.getTime() === preview.endDate.getTime()">
                {{ formatDate(preview.startDate) }}
              </template>
              <template v-else>
                {{ formatDate(preview.startDate) }} – {{ formatDate(preview.endDate) }}
              </template>
              · {{ preview.photos.length }} fotos disponibles
            </p>
            <h1 class="cg-event-title">Tus fotos de {{ preview.eventName }}</h1>
            <p class="cg-event-sub">
              Selecciona las fotos que quieres adquirir. Las originales se entregan sin marca de
              agua.
            </p>
          </div>

          <GalleryCarousel
            :photos="preview.photos"
            :selected-ids="selectedIds"
            @toggle-select="toggleSelect"
          />
        </div>

        <!-- Right: panel -->
        <aside class="cg-panel">
          <!-- Selection -->
          <div class="cg-panel__section">
            <div class="cg-panel__row">
              <span class="cg-panel__label">Tu selección</span>
              <span class="cg-panel__badge">{{ selectedCount }}</span>
            </div>

            <NButton
              v-if="preview.photos.length > 0"
              text
              type="primary"
              size="small"
              class="cg-select-all"
              @click="toggleSelectAll"
            >
              {{ allSelected ? 'Deseleccionar todas' : 'Seleccionar todas' }}
            </NButton>

            <div v-if="selectedPhotos.length > 0" class="cg-sel-grid">
              <div v-for="photo in selectedPhotos" :key="photo.id" class="cg-sel-slot">
                <img :src="photo.url" alt="" />
                <button class="cg-sel-rm" @click="removeFromSelection(photo.id)">
                  <NIcon :component="CloseCircleOutline" :size="10" />
                </button>
              </div>
            </div>

            <div v-else class="cg-sel-empty">
              <NIcon :component="ImagesOutline" :size="22" color="#9ca3af" />
              <span>Ninguna foto seleccionada</span>
            </div>
          </div>

          <!-- CTA -->
          <div class="cg-panel__cta">
            <NButton
              type="primary"
              size="large"
              block
              :disabled="selectedCount === 0"
              @click="goToContact"
            >
              <template #icon><NIcon :component="SendOutline" /></template>
              Solicitar fotos seleccionadas
            </NButton>
            <p class="cg-panel__cta-sub">
              {{
                selectedCount > 0
                  ? `${selectedCount} ${pluralize(selectedCount, 'foto seleccionada', 'fotos seleccionadas')}`
                  : 'Selecciona al menos una foto'
              }}
            </p>
          </div>

          <!-- Steps -->
          <div class="cg-panel__section cg-panel__steps">
            <span class="cg-panel__label">¿Qué sigue?</span>
            <div class="cg-step">
              <span class="cg-step__icon">
                <NIcon :component="ChatbubblesOutline" :size="16" />
              </span>
              <div>
                <p class="cg-step__title">Confirmas tu pedido</p>
                <p class="cg-step__desc">Con tus datos de facturación</p>
              </div>
            </div>
            <div class="cg-step">
              <span class="cg-step__icon">
                <NIcon :component="CardOutline" :size="16" />
              </span>
              <div>
                <p class="cg-step__title">Pagas</p>
                <p class="cg-step__desc">Con tarjeta o por transferencia bancaria</p>
              </div>
            </div>
            <div class="cg-step">
              <span class="cg-step__icon">
                <NIcon :component="CloudDownloadOutline" :size="16" />
              </span>
              <div>
                <p class="cg-step__title">Recibes tus fotos</p>
                <p class="cg-step__desc">Enlace de descarga en alta resolución</p>
              </div>
            </div>
          </div>

          <!-- Watermark note -->
          <div class="cg-panel__note">
            <p>
              Estas fotos incluyen marca de agua.
              <strong>Las originales se entregan en alta resolución y sin marca de agua</strong>
              tras confirmar la compra.
            </p>
          </div>
        </aside>
      </div>

      <!-- Step 2: Contact -->
      <template v-if="step === 'contact'">
        <ContactForm
          :token="token"
          :event-type-id="preview.eventTypeId"
          :event-name="preview.eventName"
          :organizer-name="preview.organizerName"
          :start-date="preview.startDate"
          :end-date="preview.endDate"
          :selected-photos="selectedPhotos"
          :photo-count="selectedCount"
          :is-submitting="isSubmitting || isRecordingConsent"
          :submit-blocked="isCheckoutBlocked"
          :error-message="orderErrorMessage"
          :error-action-label="orderErrorActionLabel"
          @submit="handleSubmit"
          @error-action="handleOrderErrorAction"
          @back="goBackToGallery"
        >
          <template #checkout>
            <div class="cg-checkout">
              <PricingTotalBlock
                v-if="pricing"
                emphasis="soft"
                :quantity="pricing.quantity"
                :subtotal="pricing.subtotal"
                :unit-price="pricing.unitPrice"
                :currency="pricing.currency"
                :tier="pricing.tier"
                :next-tier="pricing.nextTier"
                :photos-to-next-tier="pricing.photosToNextTier"
                :is-loading="isPricingLoading"
              />
              <p v-else class="cg-muted">Calculando precio…</p>

              <BillingCard
                v-model:consented="invoiceConsentChecked"
                :accounts="billingAccounts"
                :selected-id="selectedBillingAccountId"
                :needs-consent="needsInvoiceConsent && billingAccounts.length > 0"
                @add="billingSheet = 'form'"
                @change="billingSheet = 'picker'"
              />

              <div v-if="cardAvailable" class="cg-method" data-test="preview-payment-method">
                <p class="cg-method__label">¿Cómo quieres pagar?</p>
                <NRadioGroup v-model:value="paymentMethod" name="preview-payment-method">
                  <NRadio :value="PAYMENT_METHOD.CARD" label="Tarjeta de crédito o débito" />
                  <NRadio :value="PAYMENT_METHOD.TRANSFER" label="Transferencia bancaria" />
                </NRadioGroup>
              </div>
              <p v-else-if="paymentOptions" class="cg-muted cg-method__hint">
                Pagas por transferencia bancaria: al confirmar te enviamos los datos.
              </p>
            </div>
          </template>
        </ContactForm>

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
      </template>

      <!-- Step 3: Confirmation -->
      <OrderConfirmation
        v-if="step === 'confirmation'"
        :event-name="preview.eventName"
        :photo-count="submittedPhotoCount"
      />
    </template>

    <!-- Login Modal -->
    <NModal v-model:show="showLoginModal" preset="card" style="max-width: 400px">
      <template #header>
        <div
          style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%"
        >
          <TitanLogo :size="40" />
          <span style="font-size: 18px; font-weight: 700">Inicia sesión para continuar</span>
        </div>
      </template>

      <form
        @submit.prevent="handleModalLogin"
        style="display: flex; flex-direction: column; gap: 12px"
      >
        <input
          v-model="loginEmail"
          type="email"
          placeholder="Correo electrónico"
          required
          style="
            padding: 10px 12px;
            border: 1px solid #e0e0e6;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
          "
        />
        <input
          v-model="loginPassword"
          type="password"
          placeholder="Contraseña"
          required
          style="
            padding: 10px 12px;
            border: 1px solid #e0e0e6;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
          "
        />
        <p v-if="loginError" style="color: #d03050; font-size: 13px; margin: 0">
          {{ loginError }}
        </p>
        <NButton type="primary" block :loading="isLoggingIn" attr-type="submit">
          Iniciar sesión
        </NButton>
      </form>

      <p style="text-align: center; font-size: 13px; color: #6b7280; margin: 12px 0 0">
        ¿No tienes cuenta?
        <a
          href="#"
          style="color: #105080; font-weight: 500; text-decoration: none"
          @click.prevent="goToRegister"
        >
          Crear cuenta
        </a>
      </p>
    </NModal>
  </PublicLayout>
</template>

<style scoped src="./client-gallery-view.css" />
