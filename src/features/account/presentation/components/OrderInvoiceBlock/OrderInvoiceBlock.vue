<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'

import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import type { IMyOrderInvoice } from '../../../types/responses/my-order-invoice.response'
import type { IMyOrderBilling } from '../../../types/responses/my-order.response'

// The buyer's view of the invoice of an order. The organizer panel keeps its own InvoiceCard.
const props = defineProps<{
  invoice: IMyOrderInvoice
  billing: IMyOrderBilling | null
  busyKey: string | null
}>()

const emit = defineEmits<{
  download: [docId: string, file: 'pdf' | 'xml']
  correct: []
}>()

const current = computed(
  () =>
    props.invoice.documents.find((document) => document.current && document.type === 'invoice') ??
    null,
)
const isBusy = (file: 'pdf' | 'xml') => props.busyKey === `${current.value?.id}:${file}`
</script>

<template>
  <FormAlert
    v-if="invoice.state === 'requested' || invoice.state === 'in_process'"
    tone="info"
    title="Factura en proceso"
    text="La estamos emitiendo. Te llega a tu correo en unos minutos."
  />

  <div v-else-if="invoice.state === 'authorized'" class="invoice-block">
    <div class="invoice-block__head">
      <span class="invoice-block__eyebrow">Factura</span>
      <span class="invoice-block__pill">Autorizada</span>
    </div>
    <strong v-if="billing">{{ billing.legalName }}</strong>
    <span v-if="current" class="invoice-block__line">N.º {{ current.number }}</span>
    <span class="invoice-block__line"
      >También la enviamos a {{ billing?.email ?? 'tu correo' }}.</span
    >
    <div v-if="current?.downloadable" class="invoice-block__actions">
      <NButton
        :loading="isBusy('pdf')"
        :disabled="!!busyKey"
        @click="emit('download', current.id, 'pdf')"
      >
        PDF
      </NButton>
      <NButton
        :loading="isBusy('xml')"
        :disabled="!!busyKey"
        @click="emit('download', current.id, 'xml')"
      >
        XML
      </NButton>
    </div>
  </div>

  <FormAlert
    v-else-if="invoice.state === 'rejected'"
    tone="bad"
    title="No se pudo emitir la factura"
    text="Los datos no pasaron la validación del SRI. Corrígelos y la emitimos de nuevo."
  >
    <template v-if="invoice.canCorrect" #actions>
      <button type="button" @click="emit('correct')">Corregir datos</button>
    </template>
  </FormAlert>

  <FormAlert
    v-else-if="invoice.state === 'annulled'"
    tone="info"
    title="Factura anulada"
    text="Esta factura se anuló. Si necesitas una nueva, escríbenos."
  />
</template>

<style scoped>
.invoice-block {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  padding: var(--tt-space-3) var(--tt-space-4);
  border-radius: var(--tt-radius-l);
  background: var(--tt-surface-raised);
  box-shadow: var(--tt-card-edge), var(--tt-shadow-2);
  font-family: var(--tt-font-sans);
}

.invoice-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.invoice-block__eyebrow {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-eyebrow-size);
  line-height: var(--tt-type-eyebrow-line);
  font-weight: var(--tt-type-eyebrow-weight);
  letter-spacing: var(--tt-type-eyebrow-tracking);
  text-transform: uppercase;
}

.invoice-block__pill {
  padding: 0 var(--tt-space-2);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-success-soft);
  color: var(--tt-success-ink);
  font-size: var(--tt-type-label-size);
  font-weight: var(--tt-type-title-weight);
}

.invoice-block__line {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  font-variant-numeric: tabular-nums;
}

.invoice-block__actions {
  display: flex;
  gap: var(--tt-space-2);
  margin-block-start: var(--tt-space-2);
}
</style>
