<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NIcon, NPopconfirm, NResult, NSkeleton } from 'naive-ui'
import { CloudDownloadOutline } from '@vicons/ionicons5'
import { isAxiosError } from 'axios'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import BillingSheet from '@/shared/components/BillingSheet/BillingSheet.vue'
import { ACCOUNT_ROUTE_NAMES } from '../../routes'
import { useMyOrderDetailQuery } from '../../composables/queries/use-my-order-detail'
import { useOrderDownloads } from '../../composables/use-order-downloads'
import { useCancelMyOrder } from '../../composables/mutations/use-cancel-my-order'
import { useDownloadMyTaxDocument } from '../../composables/mutations/use-download-my-tax-document'
import { useCorrectMyOrderBilling } from '../../composables/mutations/use-correct-my-order-billing'
import BillingAccountForm from '../components/BillingAccountForm/BillingAccountForm.vue'
import InvoiceCard from '../components/InvoiceCard/InvoiceCard.vue'
import { readBillingServerError } from '../../utils/billing-server-error'
import OrderDetailHeader from '../components/OrderDetailHeader/OrderDetailHeader.vue'
import OrderPhotoGrid from '../components/OrderPhotoGrid/OrderPhotoGrid.vue'

const route = useRoute()

const orderId = computed(() => route.params.id as string)

const { data: order, isPending, isError, error, refetch } = useMyOrderDetailQuery(orderId)
const { downloadOne, downloadAll, isDownloadingAll, downloadingPhotoId } =
  useOrderDownloads(orderId)
const cancelOrder = useCancelMyOrder()
const downloadTaxDocument = useDownloadMyTaxDocument(orderId)
const correctBilling = useCorrectMyOrderBilling(orderId)

const CORRECTION_FALLBACK = 'No pudimos enviar la corrección. Intenta de nuevo.'

const isCorrecting = ref(false)

const invoiceBusyKey = computed(() => {
  const variables = downloadTaxDocument.variables.value
  return downloadTaxDocument.isPending.value && variables
    ? `${variables.docId}:${variables.file}`
    : null
})

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

const isNotFound = computed(() => isAxiosError(error.value) && error.value.response?.status === 404)
</script>

<template>
  <PublicLayout>
    <div class="my-order-detail-view">
      <NSkeleton v-if="isPending" text :repeat="4" />

      <NResult v-else-if="isNotFound" status="404" title="No encontramos esa orden">
        <template #footer>
          <RouterLink :to="{ name: ACCOUNT_ROUTE_NAMES.ORDERS }">
            <NButton>Volver a mis compras</NButton>
          </RouterLink>
        </template>
      </NResult>

      <NResult
        v-else-if="isError"
        status="error"
        title="No pudimos cargar tu compra"
        description="Intenta de nuevo en unos segundos."
      >
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <template v-else-if="order">
        <OrderDetailHeader :order="order" />

        <div v-if="order.canDownload || order.canCancel" class="my-order-detail-view__actions">
          <NButton
            v-if="order.canDownload"
            type="primary"
            size="large"
            :loading="isDownloadingAll"
            :disabled="isDownloadingAll"
            @click="downloadAll()"
          >
            <template #icon><NIcon :component="CloudDownloadOutline" /></template>
            Descargar todas
          </NButton>

          <NPopconfirm v-if="order.canCancel" @positive-click="cancelOrder.mutate(orderId)">
            <template #trigger>
              <NButton type="error" secondary size="large" :loading="cancelOrder.isPending.value">
                Cancelar orden
              </NButton>
            </template>
            ¿Seguro que quieres cancelar esta orden?
          </NPopconfirm>
        </div>

        <InvoiceCard
          v-if="order.invoice"
          class="my-order-detail-view__invoice"
          :invoice="order.invoice"
          audience="buyer"
          :busy-key="invoiceBusyKey"
          @download="(docId, file) => downloadTaxDocument.mutate({ docId, file })"
          @correct="openCorrection"
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

        <OrderPhotoGrid
          class="my-order-detail-view__photos"
          :photos="order.photos"
          :can-download="order.canDownload"
          :downloading-photo-id="downloadingPhotoId"
          @download="downloadOne"
        />
      </template>
    </div>
  </PublicLayout>
</template>

<style scoped src="./styles/my-order-detail-view.css"></style>
