<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'

import { formatDate, formatDateTime, parseDateOnly } from '@/shared/utils/date.utils'
import { INVOICE_STATE_CONFIG } from '../../../constants/invoice-state-config'
import {
  DELIVERY_KIND_LABELS,
  DELIVERY_OUTCOME_LABELS,
  DELIVERY_REQUESTER_LABELS,
  labelOf,
} from '../../../constants/invoice-delivery-labels'
import type { IMyOrderInvoice } from '../../../types/responses/my-order-invoice.response'
import type { IOrderInvoice } from '../../../types/responses/order-invoice.response'
import type { IMyOrderTaxDocument } from '../../../types/responses/my-order-tax-document.response'
import type { IOrderTaxDocument } from '../../../types/responses/order-tax-document.response'

const props = defineProps<{
  invoice: IOrderInvoice | IMyOrderInvoice
  audience: 'buyer' | 'admin'
  busyKey: string | null
}>()

const emit = defineEmits<{
  download: [docId: string, file: 'pdf' | 'xml']
  resend: [docId: string]
  correct: []
  retryAnnulment: []
}>()

const REJECTED_STATES = ['returned', 'not_authorized']
const IN_PROCESS_STATES = ['created', 'signed', 'submitted', 'received']
const ANNULLED_INVOICE_STATES = ['annulled', 'cancelled']

type InvoiceDocument = IOrderTaxDocument | IMyOrderTaxDocument

const stateConfig = computed(() => INVOICE_STATE_CONFIG[props.invoice.state])

const isAdmin = computed(() => props.audience === 'admin')

const adminInvoice = computed(() => (isAdmin.value ? (props.invoice as IOrderInvoice) : null))

const cancelledBeforeSri = computed(
  () =>
    props.invoice.state === 'annulled' && props.invoice.documents.some(isCurrentCancelledInvoice),
)

const title = computed(() =>
  cancelledBeforeSri.value ? 'Factura anulada antes de llegar al SRI' : stateConfig.value.label,
)

const rejectionMessages = computed(() =>
  'rejection' in props.invoice
    ? (props.invoice.rejection?.messages ?? [])
    : props.invoice.rejectionMessages,
)

const documents = computed(() =>
  props.invoice.documents.filter((document) => !isCurrentCancelledInvoice(document)),
)

function isCurrentCancelledInvoice(document: InvoiceDocument): boolean {
  return document.current && document.type === 'invoice' && document.state === 'cancelled'
}

function documentTitle(document: InvoiceDocument): string {
  if (document.type === 'credit_note') {
    if (document.state === 'authorized') return 'Nota de crédito autorizada'
    if (REJECTED_STATES.includes(document.state)) {
      return isAdmin.value ? 'Nota de crédito rechazada' : 'Nota de crédito en proceso'
    }
    if (IN_PROCESS_STATES.includes(document.state)) return 'Nota de crédito en proceso'
    return 'Nota de crédito'
  }
  return ANNULLED_INVOICE_STATES.includes(document.state) ? 'Factura anulada' : 'Factura'
}

function resendLabel(document: InvoiceDocument): string {
  return document.type === 'credit_note' ? 'Reenviar nota de crédito' : 'Reenviar factura'
}

function issueDateLabel(document: InvoiceDocument): string {
  return formatDate(parseDateOnly(document.issueDate))
}

function adminDocument(document: InvoiceDocument): IOrderTaxDocument | null {
  return isAdmin.value ? (document as IOrderTaxDocument) : null
}

function deliveryLabel(sentAt: string): string {
  return formatDateTime(new Date(sentAt))
}

function messageLabel(message: {
  identifier: string
  message: string
  additionalInfo: string | null
}) {
  return message.additionalInfo
    ? `${message.identifier}: ${message.message} — ${message.additionalInfo}`
    : `${message.identifier}: ${message.message}`
}
</script>

<template>
  <section class="invoice-card" data-test="invoice-card">
    <header class="invoice-card__header">
      <span class="invoice-card__icon" :style="{ background: stateConfig.color }">
        <NIcon :component="stateConfig.icon" :size="20" color="#fff" />
      </span>
      <h2 class="invoice-card__title">{{ title }}</h2>
    </header>

    <ul v-if="rejectionMessages.length" class="invoice-card__reasons">
      <li v-for="(message, index) in rejectionMessages" :key="`${index}-${message}`">
        {{ message }}
      </li>
    </ul>

    <div class="invoice-card__actions" v-if="invoice.canCorrect || adminInvoice?.canRetryAnnulment">
      <NButton
        v-if="invoice.canCorrect"
        class="invoice-card__button"
        type="primary"
        data-test="correct"
        :disabled="busyKey !== null"
        @click="emit('correct')"
      >
        Corregir datos
      </NButton>
      <NButton
        v-if="adminInvoice?.canRetryAnnulment"
        class="invoice-card__button"
        data-test="retry-annulment"
        :loading="busyKey === 'retry-annulment'"
        :disabled="busyKey !== null"
        @click="emit('retryAnnulment')"
      >
        Reintentar anulación
      </NButton>
    </div>

    <article v-for="document in documents" :key="document.id" class="invoice-card__document">
      <div class="invoice-card__document-head">
        <strong>{{ documentTitle(document) }}</strong>
        <span>{{ document.number }}</span>
        <span>{{ issueDateLabel(document) }}</span>
      </div>

      <p v-if="adminDocument(document)" class="invoice-card__access-key">
        {{ adminDocument(document)!.accessKey }}
      </p>

      <ul v-if="adminDocument(document)?.sriMessages.length" class="invoice-card__reasons">
        <li
          v-for="(message, index) in adminDocument(document)!.sriMessages"
          :key="`${index}-${message.identifier}`"
        >
          {{ messageLabel(message) }}
        </li>
      </ul>

      <div class="invoice-card__actions">
        <template v-if="document.downloadable">
          <NButton
            class="invoice-card__button"
            :data-test="`download-pdf-${document.id}`"
            :loading="busyKey === `${document.id}:pdf`"
            :disabled="busyKey !== null"
            @click="emit('download', document.id, 'pdf')"
          >
            Descargar PDF
          </NButton>
          <NButton
            class="invoice-card__button"
            :data-test="`download-xml-${document.id}`"
            :loading="busyKey === `${document.id}:xml`"
            :disabled="busyKey !== null"
            @click="emit('download', document.id, 'xml')"
          >
            Descargar XML
          </NButton>
        </template>
        <NButton
          v-if="adminDocument(document)?.resendable"
          class="invoice-card__button"
          :data-test="`resend-${document.id}`"
          :loading="busyKey === `resend:${document.id}`"
          :disabled="busyKey !== null"
          @click="emit('resend', document.id)"
        >
          {{ resendLabel(document) }}
        </NButton>
      </div>

      <ul
        v-if="adminDocument(document)?.deliveries.length"
        class="invoice-card__deliveries"
        :data-test="`deliveries-${document.id}`"
      >
        <li v-for="(delivery, index) in adminDocument(document)!.deliveries" :key="index">
          <span>{{ deliveryLabel(delivery.sentAt) }}</span>
          <span>{{ labelOf(DELIVERY_KIND_LABELS, delivery.kind) }}</span>
          <span v-if="delivery.requestedBy">
            {{ delivery.requestedBy.name }}
            ({{ labelOf(DELIVERY_REQUESTER_LABELS, delivery.requestedBy.kind) }})
          </span>
          <span
            v-for="(recipient, recipientIndex) in delivery.recipients"
            :key="`${recipientIndex}-${recipient.email}`"
          >
            {{ recipient.email }} · {{ labelOf(DELIVERY_OUTCOME_LABELS, recipient.outcome) }}
          </span>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped src="./invoice-card.css"></style>
