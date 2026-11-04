<script setup lang="ts">
import { computed, ref, toRef } from 'vue'

import { usePermissions } from '@/core/auth/use-permissions'
import { PERMISSIONS } from '@/core/auth/permissions'
import BillingSheet from '@/shared/components/BillingSheet/BillingSheet.vue'
import BillingAccountForm from '@/features/account/presentation/components/BillingAccountForm/BillingAccountForm.vue'
import InvoiceCard from '@/features/account/presentation/components/InvoiceCard/InvoiceCard.vue'
import type { ICreateBillingAccountRequest } from '@/features/account/types/requests/billing-account.request'
import type { IOrderInvoice } from '@/features/account/types/responses/order-invoice.response'
import { readBillingServerError } from '@/features/account/utils/billing-server-error'
import { useDownloadOrderTaxDocument } from '../../../composables/mutations/use-download-order-tax-document'
import { useResendOrderTaxDocument } from '../../../composables/mutations/use-resend-order-tax-document'
import { useRetryOrderAnnulment } from '../../../composables/mutations/use-retry-order-annulment'
import { useCorrectOrderBilling } from '../../../composables/mutations/use-correct-order-billing'

const props = defineProps<{
  orderId: string
  invoice: IOrderInvoice
  billing: ICreateBillingAccountRequest | null
}>()

const { has } = usePermissions()
const canManage = computed(() => has(PERMISSIONS.ORDER_INVOICE_MANAGE))

const orderId = toRef(props, 'orderId')
const downloadTaxDocument = useDownloadOrderTaxDocument(orderId)
const resendTaxDocument = useResendOrderTaxDocument(orderId)
const retryAnnulment = useRetryOrderAnnulment(orderId)
const correctBilling = useCorrectOrderBilling(orderId)

const CORRECTION_FALLBACK = 'No pudimos enviar la corrección. Intenta de nuevo.'

const isCorrecting = ref(false)

const visibleInvoice = computed<IOrderInvoice>(() =>
  canManage.value
    ? props.invoice
    : {
        ...props.invoice,
        canCorrect: false,
        canRetryAnnulment: false,
        documents: props.invoice.documents.map((document) => ({ ...document, resendable: false })),
      },
)

const busyKey = computed(() => {
  if (downloadTaxDocument.isPending.value && downloadTaxDocument.variables.value) {
    const { docId, file } = downloadTaxDocument.variables.value
    return `${docId}:${file}`
  }
  if (resendTaxDocument.isPending.value && resendTaxDocument.variables.value) {
    return `resend:${resendTaxDocument.variables.value}`
  }
  return retryAnnulment.isPending.value ? 'retry-annulment' : null
})

const correctionError = computed(() => {
  const caught = correctBilling.error.value
  return caught ? readBillingServerError(caught, CORRECTION_FALLBACK) : null
})

function openCorrection() {
  correctBilling.reset()
  isCorrecting.value = true
}

function submitCorrection(request: ICreateBillingAccountRequest) {
  correctBilling.mutate(request, { onSuccess: () => (isCorrecting.value = false) })
}
</script>

<template>
  <div class="order-invoice-section">
    <InvoiceCard
      :invoice="visibleInvoice"
      audience="admin"
      :busy-key="busyKey"
      @download="(docId, file) => downloadTaxDocument.mutate({ docId, file })"
      @resend="resendTaxDocument.mutate($event)"
      @correct="openCorrection"
      @retry-annulment="retryAnnulment.mutate()"
    />

    <BillingSheet
      v-if="isCorrecting && billing"
      title="Corregir datos de facturación"
      @close="isCorrecting = false"
    >
      <BillingAccountForm
        mode="correct"
        :needs-consent="false"
        :prefill="{ legalName: billing.legalName, email: billing.email }"
        :initial="billing"
        submit-label="Enviar corrección"
        :submitting="correctBilling.isPending.value"
        :server-error="correctionError"
        @submit="submitCorrection"
        @cancel="isCorrecting = false"
      />
    </BillingSheet>
  </div>
</template>

<style scoped src="./order-invoice-section.css" />
