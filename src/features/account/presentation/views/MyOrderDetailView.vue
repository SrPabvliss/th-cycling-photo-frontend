<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDocumentVisibility } from '@vueuse/core'
import { NButton, useMessage } from 'naive-ui'
import { isAxiosError } from 'axios'

import { problemKind } from '@/core/http/problem-kind'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import HouseSpot from '@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue'
import { useFormProblem } from '@/shared/composables/use-form-problem'
import BillingSheet from '@/shared/components/BillingSheet/BillingSheet.vue'
import ConfirmDialog from '@/shared/components/confirm-dialog/ConfirmDialog.vue'
import { EmptyState } from '@/shared/components/empty-state'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { ErrorState, TtSkeleton, useLoadPhase } from '@/shared/components/loading'
import { useVisiblePolling } from '@/shared/composables/use-visible-polling'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { failedStatus, generalProblem, type IFormProblem } from '@/shared/utils/form-problem'
import { useCartStore } from '@/shared/stores/cart.store'
import { maskPhone } from '@/shared/utils/mask-phone'
import { useCancelMyOrder } from '../../composables/mutations/use-cancel-my-order'
import { useCorrectMyOrderBilling } from '../../composables/mutations/use-correct-my-order-billing'
import { useDownloadMyTaxDocument } from '../../composables/mutations/use-download-my-tax-document'
import { useMyOrderDetailQuery } from '../../composables/queries/use-my-order-detail'
import { useMyPhonesQuery } from '../../composables/queries/use-my-phones'
import { readBillingServerError } from '../../utils/billing-server-error'
import BillingAccountForm from '../components/BillingAccountForm/BillingAccountForm.vue'
import OrderDetailHeader from '../components/OrderDetailHeader/OrderDetailHeader.vue'
import OrderInvoiceBlock from '../components/OrderInvoiceBlock/OrderInvoiceBlock.vue'
import OrderPhotoGrid from '../components/OrderPhotoGrid/OrderPhotoGrid.vue'

/** While a payment is being confirmed, the order is read again this often. */
const CONFIRMING_POLL_MS = 10_000
// A transfer is confirmed by hand, in minutes or hours: asking once a minute is enough.
const AWAITING_PAYMENT_POLL_MS = 60_000
/** A confirmation longer than this is a charge not settled yet: the buyer gets a way to ask. */
const LONG_CONFIRMATION_MS = 30 * 60_000
const CORRECTION_FALLBACK = 'No pudimos enviar la corrección. Intenta de nuevo.'
const SKELETON_TILES = 4

const route = useRoute()
const message = useMessage()
const cartStore = useCartStore()
const orderId = computed(() => route.params.id as string)

const {
  status,
  data: order,
  error,
  isFetching,
  refetch,
} = useMyOrderDetailQuery(orderId, { silent: true })
const { data: phones } = useMyPhonesQuery({ silent: true })
const cancelOrder = useCancelMyOrder({ silent: true })
const downloadTaxDocument = useDownloadMyTaxDocument(orderId)
const correctBilling = useCorrectMyOrderBilling(orderId)

// Without network a load that did not finish waits for it: the error state says so.
const { isPending, showSkeleton } = useLoadPhase(status)
const isNotFound = computed(() => isAxiosError(error.value) && error.value.response?.status === 404)

// --- Confirming: asked again while it lasts; it ends paid, or gone (payment not completed) ---
const isConfirming = computed(() => order.value?.state === 'confirming')
const wasConfirming = ref(false)
const paymentFailed = computed(() => wasConfirming.value && isNotFound.value)
useVisiblePolling(
  computed(() => isConfirming.value && !paymentFailed.value),
  CONFIRMING_POLL_MS,
  () => refetch(),
)
// --- Waiting for the transfer: the staff confirms it by hand and nothing tells this page, so
// it asks again while in view, and as soon as the person comes back to it ---
const isAwaitingPayment = computed(() => order.value?.state === 'in_process')
useVisiblePolling(isAwaitingPayment, AWAITING_PAYMENT_POLL_MS, () => refetch())
const visibility = useDocumentVisibility()
watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden' && isAwaitingPayment.value) void refetch()
})

watch(
  () => order.value?.state,
  (current, previous) => {
    if (current === 'confirming') wasConfirming.value = true
    if ((previous === 'confirming' || previous === 'in_process') && current === 'ready') {
      message.success('Pago confirmado. Tus fotos están listas.')
    }
  },
  { immediate: true },
)
const isLongConfirmation = computed(
  () =>
    !!order.value &&
    isConfirming.value &&
    Date.now() - new Date(order.value.createdAt).getTime() > LONG_CONFIRMATION_MS,
)

const phone = computed(() => {
  const main = phones.value?.find((each) => each.isPrimary)
  return main ? maskPhone(main.phoneNumber) : ''
})
const PAYMENT_METHOD_LABELS = { card: 'Tarjeta', transfer: 'Transferencia' } as const

// A transfer may already be on its way when the buyer cancels (the payment details reached them
// by WhatsApp): never say nothing was charged, say how to get it back.
const isTransfer = computed(() => order.value?.paymentMethod === 'transfer')
const cancelledText = computed(() =>
  isTransfer.value
    ? 'Si alcanzaste a transferir, escríbenos en el chat de WhatsApp del pedido y te devolvemos el dinero. Las fotos siguen disponibles en la galería del evento.'
    : 'No se cobró nada. Las fotos siguen disponibles en la galería del evento.',
)
const cancelAskText = computed(() =>
  isTransfer.value
    ? 'Si ya transferiste, no lo canceles: envía el comprobante en el chat de WhatsApp del pedido. Si no, las fotos vuelven a estar disponibles en la galería.'
    : 'No se cobra nada. Las fotos vuelven a estar disponibles en la galería.',
)
const photoLine = computed(() => {
  const count = order.value?.photos.length ?? 0
  const photos = count === 1 ? '1 foto' : `${count} fotos`
  // A gift keeps the method it was created with; it was not paid, so it is not named.
  const method = order.value?.state === 'gifted' ? null : order.value?.paymentMethod
  return method ? `${photos} · ${PAYMENT_METHOD_LABELS[method]}` : photos
})
const amount = computed(() => {
  if (!order.value) return null
  if (order.value.state === 'gifted') return 'Gratis'
  if (order.value.subtotal == null || !order.value.currency) return null
  return formatMoney(Number(order.value.subtotal), order.value.currency)
})
// Only when the api names the event: a name alone could lead to another one.
const eventGallery = computed(() =>
  order.value?.eventSlug ? `${ROUTE_PATHS.PUBLIC_GALLERY}/${order.value.eventSlug}` : null,
)

// --- Cancelling ---
const askingCancel = ref(false)
const cancelProblem = useFormProblem()
// A refusal means the order moved on; a lost connection or a server failure says only that.
const CANNOT_CANCEL: IFormProblem = { title: 'Este pedido ya no se puede cancelar.' }
// A card payment of this order is still open at the gateway: it can be cancelled once it ends.
const PAYMENT_IN_PROGRESS: IFormProblem = {
  title: 'Hay un pago en curso para este pedido. Espera unos minutos e inténtalo de nuevo.',
}
const refusalOf = (error: unknown) =>
  isAxiosError(error)
    ? (error.response?.data as { error?: { messageKey?: string } } | undefined)?.error?.messageKey
    : undefined

function askCancel() {
  cancelProblem.value = null
  askingCancel.value = true
}

async function cancel() {
  if (cancelOrder.isPending.value) return
  cancelProblem.value = null
  try {
    await cancelOrder.mutateAsync(orderId.value)
    askingCancel.value = false
    message.success('Pedido cancelado.')
  } catch (error) {
    const status = failedStatus(error)
    if (refusalOf(error) === 'order.payment_in_progress') cancelProblem.value = PAYMENT_IN_PROGRESS
    else
      cancelProblem.value =
        status >= 400 && status < 500 && status !== 429 ? CANNOT_CANCEL : generalProblem(error)
    void refetch()
  }
}

// --- Invoice ---
const invoiceBusyKey = computed(() => {
  const variables = downloadTaxDocument.variables.value
  return downloadTaxDocument.isPending.value && variables
    ? `${variables.docId}:${variables.file}`
    : null
})
const isCorrecting = ref(false)
const billingInitial = computed(() => {
  const billing = order.value?.billing
  if (!billing) return undefined
  return {
    idType: billing.idType,
    idNumber: billing.idNumber,
    legalName: billing.legalName,
    email: billing.email,
    ...(billing.address ? { address: billing.address } : {}),
  }
})
const correctionError = computed(() => {
  const caught = correctBilling.error.value
  return caught ? readBillingServerError(caught, CORRECTION_FALLBACK) : null
})
function openCorrection() {
  correctBilling.reset()
  isCorrecting.value = true
}
function submitCorrection(request: Parameters<typeof correctBilling.mutate>[0]) {
  correctBilling.mutate(request, { onSuccess: () => (isCorrecting.value = false) })
}
</script>

<template>
  <div class="order-detail">
    <div v-if="showSkeleton" class="order-detail__skeleton" aria-busy="true">
      <TtSkeleton width="70%" height="var(--tt-space-6)" radius="text" />
      <TtSkeleton width="40%" height="var(--tt-space-5)" radius="pill" />
      <div class="order-detail__skeleton-grid">
        <TtSkeleton
          v-for="tile in SKELETON_TILES"
          :key="tile"
          class="order-detail__skeleton-tile"
          height="auto"
          radius="m"
        />
      </div>
    </div>

    <template v-else-if="isPending" />

    <EmptyState
      v-else-if="paymentFailed"
      problem
      illustration="pagoRechazado"
      title="El pago no se completó"
      text="No se hizo ningún cargo. Tus fotos siguen en el carrito."
      :heading-level="1"
    >
      <template #actions>
        <NButton type="primary" size="large" block @click="cartStore.setDrawerOpen(true)">
          Ver mi carrito
        </NButton>
        <RouterLink class="order-detail__link" :to="`${ROUTE_PATHS.ACCOUNT}/orders`">
          Ir a Mis fotos
        </RouterLink>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="isNotFound"
      problem
      illustration="enlaceRoto"
      title="No encontramos este pedido"
      text="Puede que sea de otra cuenta."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink v-slot="{ href, navigate }" :to="`${ROUTE_PATHS.ACCOUNT}/orders`" custom>
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Ir a Mis fotos
          </NButton>
        </RouterLink>
      </template>
    </EmptyState>

    <ErrorState
      v-else-if="!order"
      what="tu pedido"
      :kind="problemKind(error)"
      stacked
      :retrying="isFetching"
      @retry="refetch()"
    />

    <template v-else>
      <OrderDetailHeader :order="order" />

      <FormAlert
        v-if="order.state === 'in_process'"
        tone="info"
        title="Esperando el pago"
        :text="`Te escribimos por WhatsApp${phone ? ` al ${phone}` : ''} con el total y los datos para pagar. Liberamos tus fotos cuando confirmamos el pago.`"
      />
      <FormAlert
        v-else-if="order.state === 'confirming'"
        tone="info"
        title="Estamos confirmando tu pago"
        text="El banco todavía no responde. No tienes que pagar de nuevo: te avisamos por correo cuando tus fotos estén listas."
      >
        <p v-if="isLongConfirmation">
          Está tardando más de lo normal. Si ya pasó una hora, escríbenos a info@titantv.com.ec con
          el número de tu pedido.
        </p>
      </FormAlert>
      <FormAlert
        v-else-if="order.state === 'cancelled'"
        tone="info"
        title="Pedido cancelado"
        :text="cancelledText"
      />
      <FormAlert
        v-else-if="order.state === 'gifted'"
        tone="info"
        title="Te las regaló el organizador"
        text="Descárgalas las veces que quieras."
      />

      <OrderPhotoGrid :order="order" />

      <div class="order-detail__total">
        <span class="order-detail__muted">{{ photoLine }}</span>
        <strong v-if="amount">{{ amount }}</strong>
      </div>

      <OrderInvoiceBlock
        v-if="order.canDownload && order.invoice"
        :invoice="order.invoice"
        :billing="order.billing"
        :busy-key="invoiceBusyKey"
        @download="(docId, file) => downloadTaxDocument.mutate({ docId, file })"
        @correct="openCorrection"
      />

      <!-- House carousel at the end, only once the photos are there (demo seed 47). -->
      <HouseSpot
        v-if="order.state === 'ready' || order.state === 'gifted'"
        format="AB"
        :seed="47"
      />

      <NButton
        v-if="order.canCancel"
        class="order-detail__secondary"
        size="large"
        @click="askCancel"
      >
        Cancelar pedido
      </NButton>

      <RouterLink
        v-if="order.state === 'cancelled' && eventGallery"
        v-slot="{ href, navigate }"
        :to="eventGallery"
        custom
      >
        <NButton
          tag="a"
          :href="href"
          class="order-detail__secondary"
          size="large"
          @click="navigate"
        >
          Ir a la galería del evento
        </NButton>
      </RouterLink>

      <ConfirmDialog
        :open="askingCancel"
        title="¿Cancelar este pedido?"
        :text="cancelAskText"
        confirm-label="Sí, cancelar pedido"
        keep-label="Conservar pedido"
        :busy="cancelOrder.isPending.value"
        :problem="cancelProblem"
        @confirm="cancel"
        @keep="askingCancel = false"
      />

      <BillingSheet
        v-if="isCorrecting && billingInitial"
        title="Corregir datos de facturación"
        @close="isCorrecting = false"
      >
        <BillingAccountForm
          mode="correct"
          :needs-consent="false"
          :prefill="{ legalName: billingInitial.legalName, email: billingInitial.email }"
          :initial="billingInitial"
          submit-label="Enviar corrección"
          :submitting="correctBilling.isPending.value"
          :server-error="correctionError"
          @submit="submitCorrection"
          @cancel="isCorrecting = false"
        />
      </BillingSheet>
    </template>
  </div>
</template>

<style scoped src="./styles/my-order-detail-view.css"></style>
